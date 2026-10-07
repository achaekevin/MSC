import { api } from './api';

export interface SecurityChallenge {
  token: string;
  question: string;
  type: 'math' | 'turnstile';
  turnstileSiteKey?: string;
  expiresInSeconds: number;
}

export const spamService = {
  /**
   * Fetch an anti-spam verification challenge from MSC backend
   */
  async getChallenge(): Promise<SecurityChallenge> {
    try {
      const response = await api.get<{ data: SecurityChallenge }>('/forms/challenge');
      if (response && (response as any).data) {
        return (response as any).data;
      }
      return response as any;
    } catch (err) {
      // Graceful offline fallback in case of network issue
      const num1 = Math.floor(Math.random() * 8) + 2;
      const num2 = Math.floor(Math.random() * 6) + 1;
      return {
        token: `local_fallback_${Date.now()}`,
        question: `What is ${num1} + ${num2}?`,
        type: 'math',
        expiresInSeconds: 600
      };
    }
  },

  /**
   * Verify administrative email address with token or 6-digit code
   */
  async verifyEmail(tokenOrCode: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>('/auth/verify-email', {
      token: tokenOrCode,
      code: tokenOrCode
    });
  },

  /**
   * Resend administrative email verification link and code
   */
  async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>('/auth/resend-verification', { email });
  }
};
