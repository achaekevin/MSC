import multer from 'multer';
import crypto from 'crypto';
import path from 'path';
import { BadRequestError } from '../errors/AppError.js';
import { securityMonitoringService } from '../services/securityMonitoring.service.js';

// Strictly allowed image MIME types and their authorized file extensions
const ALLOWED_MIME_MAP: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif']
};

const ALLOWED_MIME_TYPES = Object.keys(ALLOWED_MIME_MAP);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB maximum file size
const MAX_DIMENSION = 5000; // Max 5000x5000 pixels to prevent decompression bombs

// Strictly prohibited dangerous extensions (including double extension attacks)
const PROHIBITED_EXTENSIONS = [
  '.exe', '.sh', '.bat', '.cmd', '.php', '.phtml', '.php3', '.php4', '.php5',
  '.phar', '.js', '.mjs', '.ts', '.html', '.htm', '.xhtml', '.svg', '.xml',
  '.py', '.rb', '.pl', '.cgi', '.jar', '.asp', '.aspx', '.jsp', '.dll', '.so',
  '.ps1', '.vbs', '.htaccess', '.config', '.env'
];

// Memory storage ensures uploaded files are never written to executable server directories
const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const originalNameLower = file.originalname.toLowerCase().replace(/[\x00-\x1f\x80-\x9f]/g, '');

  // 1. Check for dangerous extension anywhere in the filename (prevents image.php.jpg)
  const hasDangerousExt = PROHIBITED_EXTENSIONS.some(ext =>
    originalNameLower.includes(ext)
  );

  if (hasDangerousExt) {
    securityMonitoringService.recordSuspiciousActivity({
      type: 'PROHIBITED_FILE_UPLOAD_BLOCKED',
      severity: 'HIGH',
      message: `Blocked upload containing restricted extension: ${file.originalname}`,
      ip: (req as any).ip
    });
    return cb(
      new BadRequestError(
        'Security policy violation: Executable, script, or markup files are strictly prohibited.'
      )
    );
  }

  // 2. Validate MIME type against whitelist
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestError(
        `Invalid file type (${file.mimetype}). Only standard image formats (JPEG, PNG, WEBP, GIF) are allowed.`
      )
    );
  }

  // 3. Validate that file extension strictly matches its declared MIME type
  const ext = path.extname(originalNameLower);
  const allowedExtensionsForMime = ALLOWED_MIME_MAP[file.mimetype] || [];

  if (!allowedExtensionsForMime.includes(ext)) {
    return cb(
      new BadRequestError(
        `File extension '${ext}' does not match the provided MIME type '${file.mimetype}'.`
      )
    );
  }

  // 4. Randomize filename using cryptographic entropy (never trust user-submitted filenames)
  const randomSuffix = crypto.randomBytes(16).toString('hex');
  const sanitizedExt = allowedExtensionsForMime[0];
  file.filename = `media_${Date.now()}_${randomSuffix}${sanitizedExt}`;

  cb(null, true);
};

export const uploadMedia = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1
  },
  fileFilter
});

/**
 * Parses image dimensions directly from binary header without external dependencies
 */
const getImageDimensions = (buffer: Buffer, mime: string): { width: number; height: number } | null => {
  try {
    if (mime === 'image/png' && buffer.length >= 24) {
      // PNG IHDR width at offset 16 (4 bytes big-endian), height at 20
      return {
        width: buffer.readUInt32BE(16),
        height: buffer.readUInt32BE(20)
      };
    }

    if (mime === 'image/gif' && buffer.length >= 10) {
      // GIF Logical Screen Descriptor width at offset 6 (2 bytes little-endian), height at 8
      return {
        width: buffer.readUInt16LE(6),
        height: buffer.readUInt16LE(8)
      };
    }

    if (mime === 'image/jpeg') {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xFF) break;
        const marker = buffer[offset + 1];
        // SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2) markers contain dimensions
        if ([0xC0, 0xC1, 0xC2].includes(marker)) {
          return {
            height: buffer.readUInt16BE(offset + 5),
            width: buffer.readUInt16BE(offset + 7)
          };
        }
        const length = buffer.readUInt16BE(offset + 2);
        offset += 2 + length;
      }
    }

    if (mime === 'image/webp' && buffer.length >= 30) {
      // Check VP8 chunk
      if (buffer.toString('ascii', 12, 16) === 'VP8 ') {
        return {
          width: buffer.readUInt16LE(26) & 0x3fff,
          height: buffer.readUInt16LE(28) & 0x3fff
        };
      }
      // Check VP8X chunk (extended)
      if (buffer.toString('ascii', 12, 16) === 'VP8X') {
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height };
      }
    }
  } catch {
    // If dimension parsing fails, fallback gracefully
  }
  return null;
};

/**
 * Validates raw binary signatures (magic bytes), scans for embedded scripts, and limits dimensions
 */
export const validateFileMagicBytes = (
  req: any,
  res: any,
  next: any
): void => {
  if (!req.file || !req.file.buffer) {
    return next();
  }

  const buffer: Buffer = req.file.buffer;
  if (buffer.length < 12) {
    return next(new BadRequestError('Uploaded file is corrupted or too small to verify.'));
  }

  // 1. Binary Magic Bytes Validation
  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47 &&
    buffer[4] === 0x0D && buffer[5] === 0x0A && buffer[6] === 0x1A && buffer[7] === 0x0A;
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  const isWebp =
    buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
    buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50;

  if (!isJpeg && !isPng && !isGif && !isWebp) {
    securityMonitoringService.recordSuspiciousActivity({
      type: 'SPOOFED_IMAGE_HEADER_DETECTED',
      severity: 'HIGH',
      message: `File header mismatch detected for uploaded file: ${req.file.originalname}`,
      ip: req.ip
    });
    return next(
      new BadRequestError(
        'Security verification failed: File binary header does not match genuine image signatures.'
      )
    );
  }

  // 2. Malware & Embedded Script Scanner (prevent Polyglot PHP/HTML/JS attacks in metadata)
  const bufferString = buffer.toString('latin1');
  const maliciousSignatures = [
    '<?php', '<?=', '<script', '<svg', '<iframe', '<object', '<embed',
    '<!entity', 'eval(', 'base64_decode(', 'system(', 'shell_exec(',
    'passthru(', 'powershell', 'cmd.exe', '/bin/sh', '/bin/bash'
  ];

  for (const sig of maliciousSignatures) {
    if (bufferString.includes(sig)) {
      securityMonitoringService.recordSuspiciousActivity({
        type: 'MALICIOUS_PAYLOAD_IN_UPLOAD',
        severity: 'CRITICAL',
        message: `Malicious payload (${sig}) detected inside image buffer for file: ${req.file.originalname}`,
        ip: req.ip
      });
      return next(
        new BadRequestError('Security alert: Embedded executable script or payload detected in uploaded image.')
      );
    }
  }

  // 3. Image Dimension Limits (prevents decompression bomb / pixel flood attacks)
  const dimensions = getImageDimensions(buffer, req.file.mimetype);
  if (dimensions) {
    if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
      return next(
        new BadRequestError(
          `Image resolution exceeds maximum allowed limit (${MAX_DIMENSION}x${MAX_DIMENSION} pixels). Uploaded image is ${dimensions.width}x${dimensions.height}.`
        )
      );
    }
    req.file.dimensions = dimensions;
  }

  next();
};
