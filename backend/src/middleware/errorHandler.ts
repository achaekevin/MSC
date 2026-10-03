import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { ApiErrorResponse } from '../types/index.js';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): Response => {
  // 1. Operational AppErrors
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details
      }
    };
    return res.status(err.statusCode).json(response);
  }

  // 2. Prisma Known Request Errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((err as any).code === 'P2002') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (err as any).meta?.target;
    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `A record with this ${target ? Array.isArray(target) ? target.join(', ') : target : 'value'} already exists.`,
        details: { target }
      }
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((err as any).code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record was not found in the database.'
      }
    });
  }

  // 3. Fallback for unhandled unexpected internal errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled Exception');

  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.',
      details: env.NODE_ENV === 'development' ? { message: err.message, stack: err.stack } : undefined
    }
  };

  return res.status(500).json(response);
};
