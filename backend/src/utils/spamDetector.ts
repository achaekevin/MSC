/**
 * Anti-Spam Detection & Validation Engine
 * Protects Mwancha Senior Community against automated bots, disposable emails, and malicious content.
 */

// List of disposable / temporary email domains commonly used by spambots
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  '10minemail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'throwawaymail.com',
  'trashmail.com',
  'trashmail.net',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'maildrop.cc',
  'mintemail.com',
  'nada.ltd',
  'mohmal.com',
  'fakemailgenerator.com',
  'generator.email',
  'emailondeck.com',
  'crazymailing.com',
  'burnermail.io',
  'tempail.com',
  'mytemp.email',
  'inboxkitten.com'
]);

// Patterns typical of commercial spambots, phishing, and scam broadcasts
const SPAM_PHRASES = [
  /\bcrypto\s+invest(ment|ing)?\b/i,
  /\bbitcoin\s+profit\b/i,
  /\bforex\s+trading\s+signal\b/i,
  /\bviagra\b/i,
  /\bcialis\b/i,
  /\bonline\s+casino\b/i,
  /\bslot\s+gacor\b/i,
  /\bjudi\s+online\b/i,
  /\bpoker\s+online\b/i,
  /\bseo\s+backlink(s)?\b/i,
  /\bguaranteed\s+rank\s*1\b/i,
  /\bwhatsapp\s+trading\s+group\b/i,
  /\btelegram\s+@[a-zA-Z0-9_]+\b/i,
  /\bporn\b/i,
  /\bxxx\b/i,
  /\bpayday\s+loan(s)?\b/i
];

export interface SpamCheckResult {
  isSpam: boolean;
  reason?: string;
}

export class SpamDetector {
  /**
   * Check if an email address belongs to a known temporary/throwaway email provider.
   */
  static isDisposableEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const parts = email.toLowerCase().trim().split('@');
    if (parts.length !== 2) return false;
    const domain = parts[1];
    return DISPOSABLE_EMAIL_DOMAINS.has(domain);
  }

  /**
   * Check message content for high-confidence spam markers
   */
  static analyzeContent(text: string): SpamCheckResult {
    if (!text || typeof text !== 'string') return { isSpam: false };

    // Check for blacklisted phrases
    for (const pattern of SPAM_PHRASES) {
      if (pattern.test(text)) {
        return {
          isSpam: true,
          reason: 'Content triggered spam keywords filter.'
        };
      }
    }

    // Check for excessive URL density (more than 3 URLs in a single submission message)
    const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
    if (urlMatches.length > 3) {
      return {
        isSpam: true,
        reason: 'Too many URLs detected in message body.'
      };
    }

    // Check for BBCode spam links [url=...]
    if (/\[url=[^\]]+\]/i.test(text)) {
      return {
        isSpam: true,
        reason: 'BBCode link markup detected.'
      };
    }

    return { isSpam: false };
  }

  /**
   * Enforce human submission reaction time (Time-Trap)
   * Real humans take at least 1.5 - 2.0 seconds to read and fill any form.
   * Bots submit within milliseconds of page render.
   */
  static isUnnaturallyFast(startTimeTimestamp?: number | string): boolean {
    if (!startTimeTimestamp) return false;
    const start = Number(startTimeTimestamp);
    if (isNaN(start) || start <= 0) return false;

    const elapsedMs = Date.now() - start;
    // If submitted in less than 1200ms, flag as automated bot
    return elapsedMs < 1200;
  }

  /**
   * Sanitize text against HTML tags and script execution
   */
  static sanitizeString(input: string): string {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }
}
