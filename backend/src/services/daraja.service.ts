import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { BadRequestError } from '../errors/AppError.js';

interface DarajaTokenCache {
  accessToken: string;
  expiresAt: number;
}

export interface StkPushParams {
  phoneNumber: string;
  amount: number;
  referenceCode: string;
  description: string;
}

export interface StkPushResult {
  merchantRequestId: string;
  checkoutRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

export interface StkQueryResult {
  responseCode: string;
  responseDescription: string;
  merchantRequestId: string;
  checkoutRequestId: string;
  resultCode: string;
  resultDesc: string;
}

export class DarajaService {
  private tokenCache: DarajaTokenCache | null = null;

  private getBaseUrl(): string {
    return env.MPESA_ENVIRONMENT === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Normalizes Kenyan phone numbers to the 254XXXXXXXXX standard format
   */
  formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/\D/g, '');

    if (clean.startsWith('0')) {
      clean = '254' + clean.slice(1);
    } else if (clean.startsWith('7') || clean.startsWith('1')) {
      clean = '254' + clean;
    } else if (clean.startsWith('254')) {
      // already valid prefix
    } else {
      throw new BadRequestError('Invalid phone number format. Please provide a valid Kenyan mobile number (e.g. 0712345678).');
    }

    if (clean.length !== 12) {
      throw new BadRequestError('Invalid Kenyan phone number length. Expected 12 digits (254XXXXXXXXX).');
    }

    return clean;
  }

  /**
   * Generates timestamp in YYYYMMDDHHmmss format (EAT / UTC)
   */
  private getTimestamp(): string {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return (
      now.getFullYear().toString() +
      pad(now.getMonth() + 1) +
      pad(now.getDate()) +
      pad(now.getHours()) +
      pad(now.getMinutes()) +
      pad(now.getSeconds())
    );
  }

  /**
   * Generates base64-encoded Daraja password: Base64(Shortcode + Passkey + Timestamp)
   */
  private generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  }

  /**
   * Fetches or retrieves cached OAuth access token from Daraja API
   */
  async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.tokenCache && this.tokenCache.expiresAt > now + 60000) {
      return this.tokenCache.accessToken;
    }

    // In local development or testing when no real consumer key is provided, use mock token
    if (
      !env.MPESA_CONSUMER_KEY ||
      !env.MPESA_CONSUMER_SECRET ||
      env.MPESA_CONSUMER_KEY === 'your_daraja_consumer_key'
    ) {
      logger.warn('Mocking Daraja OAuth token (sandbox credentials not configured).');
      const mockToken = `mock_daraja_token_${Date.now()}`;
      this.tokenCache = {
        accessToken: mockToken,
        expiresAt: now + 3500 * 1000
      };
      return mockToken;
    }

    const auth = Buffer.from(`${env.MPESA_CONSUMER_KEY}:${env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const url = `${this.getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Basic ${auth}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ status: response.status, errorText }, 'Daraja OAuth token request failed');
        throw new Error(`Daraja OAuth authorization failed with HTTP ${response.status}: ${errorText}`);
      }

      const data = (await response.json()) as { access_token: string; expires_in: string };
      const expiresInSec = parseInt(data.expires_in, 10) || 3599;

      this.tokenCache = {
        accessToken: data.access_token,
        expiresAt: now + expiresInSec * 1000
      };

      return data.access_token;
    } catch (err: any) {
      logger.error({ err }, 'Failed to connect to Safaricom Daraja API for OAuth token');
      throw new Error(`Payment gateway connection error: ${err.message || 'Unable to authenticate with M-Pesa'}`);
    }
  }

  /**
   * Initiates Lipa Na M-Pesa Online (STK Push)
   */
  async initiateStkPush(params: StkPushParams): Promise<StkPushResult> {
    const formattedPhone = this.formatPhoneNumber(params.phoneNumber);
    const shortcode = env.MPESA_SHORTCODE || '174379';
    const passkey = env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Safaricom standard sandbox passkey
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(shortcode, passkey, timestamp);

    // Default callback URL if not explicitly configured in env
    const callbackUrl =
      env.MPESA_CALLBACK_URL ||
      `${env.STAGING_FRONTEND_URL || 'https://mwancha-senior-community-msc-production.up.railway.app'}/api/v1/payments/mpesa/callback`;

    // Simulated sandbox response when credentials are mock/unconfigured
    if (
      !env.MPESA_CONSUMER_KEY ||
      env.MPESA_CONSUMER_KEY === 'your_daraja_consumer_key'
    ) {
      logger.warn('Simulating STK Push request for development sandbox.');
      const mockCheckoutId = `ws_CO_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const mockMerchantId = `MR_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

      return {
        merchantRequestId: mockMerchantId,
        checkoutRequestId: mockCheckoutId,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing'
      };
    }

    const token = await this.getAccessToken();
    const url = `${this.getBaseUrl()}/mpesa/stkpush/v1/processrequest`;

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(params.amount),
      PartyA: formattedPhone,
      PartyB: shortcode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: params.referenceCode.slice(0, 12),
      TransactionDesc: params.description.slice(0, 32)
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as any;

      if (!response.ok || data.ResponseCode !== '0') {
        logger.error({ responseStatus: response.status, data }, 'Daraja STK Push rejected');
        throw new BadRequestError(
          data.errorMessage || data.CustomerMessage || data.ResponseDescription || 'M-Pesa STK push prompt could not be initiated.'
        );
      }

      return {
        merchantRequestId: data.MerchantRequestID,
        checkoutRequestId: data.CheckoutRequestID,
        responseCode: data.ResponseCode,
        responseDescription: data.ResponseDescription,
        customerMessage: data.CustomerMessage
      };
    } catch (err: any) {
      logger.error({ err }, 'Error during Daraja STK Push execution');
      throw err;
    }
  }

  /**
   * Queries Safaricom Daraja for the real-time status of an STK Push
   */
  async queryStkStatus(checkoutRequestId: string): Promise<StkQueryResult> {
    const shortcode = env.MPESA_SHORTCODE || '174379';
    const passkey = env.MPESA_PASSKEY || 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(shortcode, passkey, timestamp);

    if (
      !env.MPESA_CONSUMER_KEY ||
      env.MPESA_CONSUMER_KEY === 'your_daraja_consumer_key'
    ) {
      // Mock status for demo/testing
      return {
        responseCode: '0',
        responseDescription: 'Success',
        merchantRequestId: 'MOCK_MR',
        checkoutRequestId,
        resultCode: '0',
        resultDesc: 'The service request is processed successfully.'
      };
    }

    const token = await this.getAccessToken();
    const url = `${this.getBaseUrl()}/mpesa/stkpushquery/v1/query`;

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = (await response.json()) as any;
    return {
      responseCode: data.ResponseCode,
      responseDescription: data.ResponseDescription,
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
      resultCode: data.ResultCode,
      resultDesc: data.ResultDesc
    };
  }
}

export const darajaService = new DarajaService();
