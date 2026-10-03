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
