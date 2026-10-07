import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from '../errors/AppError.js';
import { SpamDetector } from '../utils/spamDetector.js';
import { spamChallengeService } from '../services/spamChallenge.service.js';

// Honeypot field names that real users never fill out (hidden by CSS/accessibility)
const HONEYPOT_FIELDS = [
  'website_hp',
  'hp_confirm',
  'bot_trap',
  'fax_number',
  'company_secret',
  'user_website_url'
];

export interface SpamProtectionOptions {
  checkHoneypot?: boolean;
  checkTimeTrap?: boolean;
  checkDisposableEmail?: boolean;
  checkContentPatterns?: boolean;
  requireChallenge?: boolean;
}

/**
 * Express middleware that intercepts spambots, honeypot traps, and malicious automated inputs
 */
export const spamProtection = (options: SpamProtectionOptions = {
  checkHoneypot: true,
  checkTimeTrap: true,
  checkDisposableEmail: true,
  checkContentPatterns: true,
  requireChallenge: false
}) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const body = req.body || {};

      // 1. Honeypot Trap Inspection
      if (options.checkHoneypot !== false) {
        for (const field of HONEYPOT_FIELDS) {
          if (body[field] && typeof body[field] === 'string' && body[field].trim().length > 0) {
            console.warn(`[Security Alert] Honeypot triggered via field '${field}' from IP: ${req.ip}`);
            throw new BadRequestError('Security Verification Failed: Automated spam submission detected.');
          }
        }
      }

      // 2. Time-Trap Inspection (Reaction time analysis)
      if (options.checkTimeTrap !== false && body._formStartTime) {
        if (SpamDetector.isUnnaturallyFast(body._formStartTime)) {
          console.warn(`[Security Alert] Time-trap triggered (< 1.2s submission) from IP: ${req.ip}`);
          throw new BadRequestError('Submission was received unnaturally fast. Automated bot requests are prohibited.');
        }
      }

      // 3. Disposable Email Verification
      if (options.checkDisposableEmail !== false && body.email) {
        if (SpamDetector.isDisposableEmail(body.email)) {
          throw new BadRequestError(
            'Temporary or disposable email providers are not accepted. Please provide your legitimate active email address.'
          );
        }
      }

      // 4. Content Analysis (Spam phrase & URL density heuristics)
      if (options.checkContentPatterns !== false) {
        const textFieldsToCheck = [body.message, body.itemDescription, body.experience, body.subject];
        for (const text of textFieldsToCheck) {
          if (text) {
            const check = SpamDetector.analyzeContent(text);
            if (check.isSpam) {
              console.warn(`[Security Alert] Content spam filter triggered: ${check.reason} from IP: ${req.ip}`);
              throw new BadRequestError(`Message rejected: ${check.reason || 'Content flagged as spam.'}`);
            }
          }
        }
      }

      // 5. Anti-Spam Challenge Verification (Math verification or Turnstile)
      if (options.requireChallenge || body.challengeToken || body.turnstileToken) {
        const result = await spamChallengeService.verifyChallenge(
          body.challengeToken,
          body.challengeAnswer,
          body.turnstileToken
        );

        if (!result.valid) {
          throw new BadRequestError(result.reason || 'Security verification challenge failed.');
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
