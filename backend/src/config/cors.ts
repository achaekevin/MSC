import { CorsOptions } from 'cors';
import { env } from './env.js';

const allowedOrigins: string[] = [
  env.FRONTEND_URL,
  env.STAGING_FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
].filter(Boolean);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server) where origin is undefined
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow any origin for network testing
    if (env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin '${origin}' not allowed by CORS whitelist.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'cache-control',
    'Pragma',
    'pragma',
    'Expires',
    'X-CSRF-Token',
    'If-Modified-Since'
  ],
  exposedHeaders: ['Set-Cookie', 'Content-Range', 'X-Total-Count'],
  optionsSuccessStatus: 200
};
