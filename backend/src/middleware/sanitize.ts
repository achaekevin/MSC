import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes an individual string value against dangerous HTML/script injections
 */
function sanitizeValue(val: any): any {
  if (typeof val === 'string') {
    // Strip malicious script tags, event handlers, and javascript: pseudo-protocol
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript\s*:\s*/gi, '')
      .trim();
  } else if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  } else if (val !== null && typeof val === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      cleanObj[k] = sanitizeValue(v);
    }
    return cleanObj;
  }
  return val;
}

/**
 * Global input sanitization middleware
 * Protects all incoming requests against stored and reflected cross-site scripting (XSS).
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeValue(req.query);
  }
  next();
};
