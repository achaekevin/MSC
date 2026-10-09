import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';
import { ApiErrorResponse } from '../types/index.js';
import { securityMonitoringService } from '../services/securityMonitoring.service.js';

export const errorHandler = (
  err: Error & { status?: number; statusCode?: number; code?: string; type?: string; meta?: any },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  // 1. Operational AppErrors
  if (err instanceof AppError) {
    const response: ApiErrorResponse & { message?: string } = {
      success: false,
      message: err.message,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
    return res.status(err.statusCode).json(response);
  }

  // 2. Body-parser JSON syntax error
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON payload received.',
      error: {
        code: 'INVALID_JSON',
        message: 'The request body could not be parsed as valid JSON.'
      }
    });
  }

  // 3. Multer file upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload failed.';
    let code = 'UPLOAD_ERROR';
    let status = 400;

    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'Uploaded file exceeds the maximum allowed size limit.';
      code = 'FILE_TOO_LARGE';
      status = 413;
    } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      message = 'An unexpected file field was included in the upload.';
      code = 'UNEXPECTED_FIELD';
    }

    return res.status(status).json({
      success: false,
      message,
      error: { code, message }
    });
  }

  // 4. JWT Authentication / Token errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupt authentication token.',
      error: {
        code: 'INVALID_TOKEN',
        message: 'Please sign in again to obtain a valid access token.'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Your authentication session has expired.',
      error: {
        code: 'TOKEN_EXPIRED',
        message: 'Your access token has expired. Please refresh your session or log in.'
      }
    });
  }

  // 5. Prisma Database Errors
  if (err.code === 'P2002') {
    const target = err.meta?.target;
    const fieldName = target ? (Array.isArray(target) ? target.join(', ') : String(target)) : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with this ${fieldName} already exists.`,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${fieldName} already exists.`,
        details: { target }
      }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'The requested resource was not found.',
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record does not exist or has already been removed.'
      }
    });
  }

  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Cannot perform this operation because of related data dependencies.',
      error: {
        code: 'FOREIGN_KEY_VIOLATION',
        message: 'A referenced item does not exist or is currently attached to other records.'
      }
    });
  }

  if (err.code === 'P1001' || err.code === 'P1002' || err.code === 'P1008' || err.code === 'P1017') {
    logger.error({ err, path: req.path, method: req.method }, 'Database Connection Unavailable');
    return res.status(503).json({
      success: false,
      message: 'Database service is temporarily unavailable.',
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'The database service is temporarily unreachable. Please try again shortly.'
      }
    });
  }

  // 6. Fallback for unhandled unexpected internal errors
  logger.error({ err, path: req.path, method: req.method, ip: req.ip }, 'Unhandled Technical Exception');

  // Record 5xx error in security monitoring subsystem
  try {
    securityMonitoringService.recordApiError({
      statusCode: 500,
      method: req.method,
      path: req.path,
      ip: req.ip || req.socket.remoteAddress,
      errorMessage: err.message,
      requestId: (req as any).id || (req.headers['x-request-id'] as string)
    });
  } catch {
    // Monitoring recording failure should not break error response
  }

  // Never expose internal stack traces, SQL queries, or filesystem paths to visitors
  return res.status(500).json({
    success: false,
    message: 'An unexpected server error occurred.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Our technical desk has logged this incident.'
    }
  });
};
