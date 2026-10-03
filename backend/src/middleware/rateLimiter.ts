import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { RateLimitError } from '../errors/AppError.js';

export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many requests. Please try again after a minute.');
  }
});

export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many login attempts. Please wait 1 minute before trying again.');
  }
});

export const contactFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Too many contact inquiries from this IP. Please try again later.');
  }
});

export const volunteerFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Volunteer application rate limit reached. Please try again later.');
  }
});

export const partnershipFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: () => {
    throw new RateLimitError('Partnership application rate limit reached. Please try again later.');
  }
});
