import crypto from 'crypto';
import { env } from '../config/env.js';

interface ChallengeData {
  token: string;
  question: string;
  type: 'math' | 'turnstile';
  turnstileSiteKey?: string;
  expiresInSeconds: number;
}

export class SpamChallengeService {
  private secretKey: string;

  constructor() {
    this.secretKey = env.JWT_ACCESS_SECRET || 'msc-anti-spam-secret-seed-2024';
  }

  /**
   * Generate an anti-spam challenge
   * Includes mathematical proof question and signs token with HMAC SHA-256
   */
  generateChallenge(): ChallengeData {
    const num1 = Math.floor(Math.random() * 12) + 1; // 1 - 12
    const num2 = Math.floor(Math.random() * 9) + 1;  // 1 - 9
    const isAddition = Math.random() > 0.3; // 70% addition, 30% subtraction

    let question = '';
    let answer = 0;

    if (isAddition) {
      question = `What is ${num1} + ${num2}?`;
      answer = num1 + num2;
    } else {
      const high = Math.max(num1, num2);
      const low = Math.min(num1, num2);
      question = `What is ${high} - ${low}?`;
      answer = high - low;
    }

    const expiresAt = Date.now() + 20 * 60 * 1000; // 20 minutes validity
    const nonce = crypto.randomBytes(8).toString('hex');

    const payload = JSON.stringify({ ans: answer, exp: expiresAt, nonce });
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      crypto.createHash('sha256').update(this.secretKey).digest(),
      Buffer.alloc(16, 0)
    );
    let encrypted = cipher.update(payload, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const signature = crypto
      .createHmac('sha256', this.secretKey)
      .update(encrypted)
      .digest('hex');

    const token = `${encrypted}.${signature}`;

    const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY;
    const hasTurnstile = Boolean(turnstileSiteKey && process.env.TURNSTILE_SECRET_KEY);

    return {
      token,
      question,
      type: hasTurnstile ? 'turnstile' : 'math',
      turnstileSiteKey: hasTurnstile ? turnstileSiteKey : undefined,
      expiresInSeconds: 1200
    };
  }

  /**
   * Verify challenge submission (supports either Math Challenge or Cloudflare Turnstile)
   */
  async verifyChallenge(
    challengeToken?: string,
    challengeAnswer?: string | number,
    turnstileToken?: string
  ): Promise<{ valid: boolean; reason?: string }> {
    // 1. If Turnstile is active and token provided, verify with Cloudflare API
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    if (turnstileSecret && turnstileToken) {
      try {
        const formData = new URLSearchParams();
        formData.append('secret', turnstileSecret);
        formData.append('response', turnstileToken);

        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
          method: 'POST',
          body: formData
        });

        const outcome = (await response.json()) as { success: boolean; 'error-codes'?: string[] };
        if (outcome.success) {
          return { valid: true };
        }
        return { valid: false, reason: 'Cloudflare Turnstile verification failed.' };
      } catch (err) {
        console.warn('Turnstile verification request failed, falling back to local challenge:', err);
      }
    }

    // 2. Validate local math challenge token
    if (!challengeToken) {
      return { valid: false, reason: 'Anti-spam challenge token is missing.' };
    }

    const parts = challengeToken.split('.');
    if (parts.length !== 2) {
      return { valid: false, reason: 'Malformed anti-spam challenge token.' };
    }

    const [encrypted, providedSignature] = parts;

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', this.secretKey)
      .update(encrypted)
      .digest('hex');

    if (providedSignature !== expectedSignature) {
      return { valid: false, reason: 'Invalid challenge signature.' };
    }

    try {
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        crypto.createHash('sha256').update(this.secretKey).digest(),
        Buffer.alloc(16, 0)
      );
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      const data = JSON.parse(decrypted);

      if (Date.now() > data.exp) {
        return { valid: false, reason: 'Security challenge has expired. Please refresh and try again.' };
      }

      if (challengeAnswer === undefined || challengeAnswer === null || String(challengeAnswer).trim() === '') {
        return { valid: false, reason: 'Please answer the security verification question.' };
      }

      const parsedUserAnswer = parseInt(String(challengeAnswer).trim(), 10);
      if (isNaN(parsedUserAnswer) || parsedUserAnswer !== data.ans) {
        return { valid: false, reason: 'Incorrect security verification answer. Please try again.' };
      }

      return { valid: true };
    } catch {
      return { valid: false, reason: 'Security challenge decoding failed.' };
    }
  }
}

export const spamChallengeService = new SpamChallengeService();
