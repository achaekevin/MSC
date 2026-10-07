import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { RateLimitError } from '../errors/AppError.js';

// General API Rate Limiter
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many requests. Please try again after a minute.');
  }
});

/**
 * Authentication Rate Limiter
 * Explicit Policy: Maximum of 3 attempts per authentication route per 15 minutes.
 * Scoped per IP and individual authentication route path.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Maximum of 3 attempts per authentication route per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    const route = req.baseUrl ? `${req.baseUrl}${req.path}` : req.originalUrl || req.path;
    return `auth:${ip}:${route}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Security Policy Limit Reached: Maximum of 3 attempts per 15 minutes allowed for this authentication route. Please wait 15 minutes before trying again.'
    );
  }
});

/**
 * Contact Form Submission Throttler
 * 3 attempts per 15 minutes per IP
 */
export const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `contact:${ip}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Spam protection: Maximum of 3 contact inquiries per 15 minutes reached. Please wait before submitting another message.'
    );
  }
});

/**
 * Volunteer Application Throttler
 * 3 attempts per 15 minutes per IP
 */
export const volunteerFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `volunteer:${ip}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Spam protection: Maximum of 3 volunteer applications per 15 minutes reached. Please try again later.'
    );
  }
});

/**
 * Partnership Application Throttler
 * 3 attempts per 15 minutes per IP
 */
export const partnershipFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `partnership:${ip}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Spam protection: Maximum of 3 partnership proposals per 15 minutes reached. Please try again later.'
    );
  }
});

/**
 * In-Kind Donation Pledge Throttler
 * 3 attempts per 15 minutes per IP
 */
export const inKindDonationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `inkind:${ip}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Spam protection: Maximum of 3 donation pledges per 15 minutes reached. Please try again later.'
    );
  }
});

/**
 * Newsletter Subscription Throttler
 * 3 subscription attempts per 15 minutes per IP
 */
export const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket?.remoteAddress || 'unknown';
    return `newsletter:${ip}`;
  },
  handler: () => {
    throw new RateLimitError(
      'Spam protection: Maximum of 3 newsletter subscription attempts per 15 minutes reached.'
    );
  }
});

/**
 * Anti-Spam Challenge Generation Throttler
 * Prevents rapid automated harvesting of challenge tokens
 */
export const challengeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many challenge requests. Please wait a moment.');
  }
});
