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
  EMAIL_FROM: z.string().default('Mwancha Senior Community <mwanchaseniorcommunity@gmail.com>'),
  ADMIN_NOTIFICATION_EMAIL: z.string().default('mwanchaseniorcommunity@gmail.com'),

  // Optional SMTP Configuration (for Gmail, custom SMTP, or transactional mail)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true' || val === '1';
    return Boolean(val);
  }, z.boolean()).default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  INITIAL_ADMIN_EMAIL: z.string().email().default('mwanchaseniorcommunity@gmail.com'),
  INITIAL_ADMIN_PASSWORD: z.string().min(1).default('admin@1'),
  INITIAL_ADMIN_NAME: z.string().default('MSC System Administrator'),

  ADMIN_INVITE_CODE: z.string().default('MSC-ADMIN-2024-SECURE'),

  // Payment Provider Gateway Architecture
  PAYMENT_PROVIDER: z.enum(['daraja', 'payhero']).default('daraja'),

  // Safaricom Daraja M-Pesa API settings
  MPESA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  MPESA_CONSUMER_KEY: z.string().default(''),
  MPESA_CONSUMER_SECRET: z.string().default(''),
  MPESA_PASSKEY: z.string().default(''),
  MPESA_SHORTCODE: z.string().default('174379'),
  MPESA_INITIATOR_NAME: z.string().default('testapi'),
  MPESA_CALLBACK_URL: z.string().default(''),
  MPESA_CALLBACK_SECRET: z.string().default(''),

  DARAJA_ENVIRONMENT: z.enum(['sandbox', 'production']).default('sandbox'),
  DARAJA_CONSUMER_KEY: z.string().default(''),
  DARAJA_CONSUMER_SECRET: z.string().default(''),
  DARAJA_PASSKEY: z.string().default(''),
  DARAJA_SHORTCODE: z.string().default('174379'),
  DARAJA_CALLBACK_URL: z.string().default(''),
  DARAJA_CALLBACK_SECRET: z.string().default(''),

  // PayHero Kenya API settings
  PAYHERO_API_USERNAME: z.string().default(''),
  PAYHERO_API_PASSWORD: z.string().default(''),
  PAYHERO_CHANNEL_ID: z.string().default(''),
  PAYHERO_WEBHOOK_SECRET: z.string().default(''),
  PAYHERO_BASE_URL: z.string().default('https://backend.payhero.co.ke/api/v2'),
  PAYHERO_CALLBACK_URL: z.string().default(''),

  // Digital Commerce & Downloads
  DEFAULT_CURRENCY: z.string().default('KES'),
  MINIMUM_DONATION_AMOUNT: z.coerce.number().default(50),
  MAX_DOWNLOADS_PER_PURCHASE: z.coerce.number().default(10),
  DOWNLOAD_TOKEN_SECRET: z.string().min(16).default('msc_download_token_secret_high_entropy_2026_secure'),
  DOWNLOAD_TOKEN_EXPIRY_SECONDS: z.coerce.number().default(3600),
  PRIVATE_STORAGE_PATH: z.string().default('./storage/private_publications'),
  FINANCE_NOTIFICATION_EMAIL: z.string().default('mwanchaseniorcommunity@gmail.com')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('Invalid environment variables:', parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;

// Security audit enforcement for production deployments
if (env.NODE_ENV === 'production') {
  const fatalErrors: string[] = [];

  if (env.JWT_ACCESS_SECRET.includes('development') || env.JWT_ACCESS_SECRET.length < 32) {
    fatalErrors.push('FATAL SECURITY ERROR: JWT_ACCESS_SECRET must be at least 32 characters and cannot use development fallback in production.');
  }
  if (env.JWT_REFRESH_SECRET.includes('development') || env.JWT_REFRESH_SECRET.length < 32) {
    fatalErrors.push('FATAL SECURITY ERROR: JWT_REFRESH_SECRET must be at least 32 characters and cannot use development fallback in production.');
  }
  if (env.ADMIN_INVITE_CODE === 'MSC-ADMIN-2024-SECURE' || env.ADMIN_INVITE_CODE.length < 16) {
    fatalErrors.push('FATAL SECURITY ERROR: ADMIN_INVITE_CODE cannot use the default published key in production. Set a unique, private 16+ character code.');
  }

  if (fatalErrors.length > 0) {
    console.error('\n==================== PRODUCTION SECURITY CONFIGURATION ERROR ====================');
    fatalErrors.forEach(err => console.error(err));
    console.error('=================================================================================\n');
    process.exit(1);
  }

  if (env.INITIAL_ADMIN_PASSWORD === 'admin@1') {
    console.warn(
      '⚠️ SECURITY WARNING: Default INITIAL_ADMIN_PASSWORD ("admin@1") detected in production! Change the initial administrative password immediately.'
    );
  }
}
