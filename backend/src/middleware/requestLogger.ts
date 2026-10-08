import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { logger } from '../config/logger.js';
import { securityMonitoringService } from '../services/securityMonitoring.service.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();

  // Attach request ID for downstream tracing
  (req as any).id = requestId;
  res.setHeader('X-Request-Id', requestId);

  // Hook into response finish event for structured performance and status logging
  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

    // Log format for monitoring
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode,
      durationMs,
      ip: clientIp,
      userAgent: req.headers['user-agent']
    };

    if (statusCode >= 500) {
      logger.error(logData, `HTTP ${req.method} ${req.path} completed with server error`);
    } else if (statusCode === 429) {
      logger.warn(logData, `HTTP 429 Rate limit triggered on ${req.method} ${req.path}`);
      securityMonitoringService.recordSuspiciousActivity({
        type: 'RATE_LIMIT_TRIGGERED',
        severity: 'MEDIUM',
        message: `Rate limit hit by IP ${clientIp} on endpoint ${req.method} ${req.path}`,
        ip: clientIp,
        metadata: { path: req.path, method: req.method }
      });
    } else if (statusCode === 401 || statusCode === 403) {
      if (req.path.startsWith('/api/v1/admin')) {
        securityMonitoringService.recordSuspiciousActivity({
          type: 'UNAUTHORIZED_ADMIN_ACCESS',
          severity: 'LOW',
          message: `Unauthorized attempt to access admin endpoint ${req.method} ${req.path} from IP ${clientIp}`,
          ip: clientIp
        });
      }
    } else if (statusCode >= 400) {
      logger.warn(logData, `HTTP ${req.method} ${req.path} client error`);
    } else {
      logger.info(logData, `HTTP ${req.method} ${req.path}`);
    }
  });

  next();
};
