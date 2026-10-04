import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Network Access Security Middleware
 * Provides additional security controls for network-accessible deployments
 */
export const networkAccessSecurity = (req: Request, res: Response, next: NextFunction) => {
  // Skip in development mode
  if (env.NODE_ENV === 'development') {
    return next();
  }

  // Log network access attempts for monitoring
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  logger.info({
    ip: clientIP,
    userAgent,
    method: req.method,
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  }, 'Network access attempt');

  // Add security headers for network access
  res.set({
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  });

  next();
};

/**
 * Check if network access is allowed based on configuration
 */
export const checkNetworkAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!env.ALLOW_NETWORK_ACCESS && req.hostname !== 'localhost' && req.hostname !== '127.0.0.1') {
    logger.warn({
      ip: req.ip,
      hostname: req.hostname,
      path: req.originalUrl
    }, 'Network access denied - not allowed by configuration');
    
    return res.status(403).json({
      success: false,
      message: 'Network access is not enabled for this server',
      error: 'NETWORK_ACCESS_DISABLED'
    });
  }

  next();
};