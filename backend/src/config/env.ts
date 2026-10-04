import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'), // Allow binding to all network interfaces
  DATABASE_URL: z.string().default('mysql://root:root@localhost:3306/mwancha_community'),

  JWT_ACCESS_SECRET: z.string().min(16).default('msc_development_access_secret_key_must_be_very_long_and_secure_2026'),
  JWT_REFRESH_SECRET: z.string().min(16).default('msc_development_refresh_secret_key_must_be_very_long_and_secure_2026'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  FRONTEND_URL: z.string().default('http://localhost:5173'),
  STAGING_FRONTEND_URL: z.string().default('https://staging.mwanchasenior.org'),
  COOKIE_DOMAIN: z.string().default('localhost'),
  
  // Network access settings
  ALLOW_NETWORK_ACCESS: z.coerce.boolean().default(true),
  TRUSTED_NETWORKS: z.string().default(''), // Comma-separated list of trusted IP ranges

  CLOUDINARY_CLOUD_NAME: z.string().default('demo_cloud'),
  CLOUDINARY_API_KEY: z.string().default('123456789'),
  CLOUDINARY_API_SECRET: z.string().default('secret'),

  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().default('Mwancha Senior Community <notifications@mwanchasenior.org>'),
  ADMIN_NOTIFICATION_EMAIL: z.string().default('secretariat@mwanchasenior.org'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  INITIAL_ADMIN_EMAIL: z.string().email().default('admin@mwanchasenior.org'),
  INITIAL_ADMIN_PASSWORD: z.string().min(8).default('ChangeMeImmediately123!'),
  INITIAL_ADMIN_NAME: z.string().default('MSC System Administrator')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
