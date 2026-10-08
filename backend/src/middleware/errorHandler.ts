import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { ApiErrorResponse } from '../types/index.js';
import { securityMonitoringService } from '../services/securityMonitoring.service.js';

export const errorHandler = (
  err: Error,
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

  // 2. Prisma Known Request Errors
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((err as any).code === 'P2002') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const target = (err as any).meta?.target;
    return res.status(409).json({
      success: false,
      message: `A record with this ${target ? Array.isArray(target) ? target.join(', ') : target : 'value'} already exists.`,
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
      message: 'The requested record was not found.',
      error: {
        code: 'NOT_FOUND',
        message: 'The requested record was not found in the database.'
      }
    });
  }

  // 3. Fallback for unhandled unexpected internal errors
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled Exception');

  // Record 5xx error in security monitoring subsystem
  securityMonitoringService.recordApiError({
    statusCode: 500,
    method: req.method,
    path: req.path,
    ip: req.ip || req.socket.remoteAddress,
    errorMessage: err.message,
    requestId: (req as any).id || (req.headers['x-request-id'] as string)
  });

  // Never expose internal filesystem paths (e.g. C:\Users\... or /home/...) or MySQL credentials to visitors
  const response = {
    success: false,
    message: 'An unexpected error occurred.',
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred. Please try again later.'
    }
  };

  return res.status(500).json(response);
};
