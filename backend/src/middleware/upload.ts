import multer from 'multer';
import { BadRequestError } from '../errors/AppError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Reject executable or dangerous file types
  const lowerName = file.originalname.toLowerCase();
  const dangerousExtensions = ['.exe', '.sh', '.bat', '.cmd', '.php', '.js', '.ts', '.html', '.py'];
  if (dangerousExtensions.some(ext => lowerName.endsWith(ext))) {
    return cb(new BadRequestError('Executable or script files are strictly prohibited.'));
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new BadRequestError(
        `Invalid file format: ${file.mimetype}. Allowed formats are JPEG, PNG, WEBP, and GIF.`
      )
    );
  }

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
 * Validates the raw file buffer binary signature (magic bytes)
 * Ensures that files cannot spoof their MIME type or contain polyglot exploits.
 */
export const validateFileMagicBytes = (
  req: any,
  res: any,
  next: any
): void => {
  if (!req.file || !req.file.buffer) {
    return next();
  }

  const buffer = req.file.buffer;
  if (buffer.length < 12) {
    return next(new BadRequestError('Uploaded file is corrupted or too small to verify.'));
  }

  const isJpeg = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  const isGif = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38;
  const isWebp =
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50;

  if (!isJpeg && !isPng && !isGif && !isWebp) {
    return next(
      new BadRequestError(
        'Security verification failed: File binary header does not match valid image signatures (JPEG, PNG, GIF, WEBP).'
      )
    );
  }

  next();
};
