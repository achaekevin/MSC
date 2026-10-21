import crypto from 'crypto';
import {
  IPaymentProvider,
  StkPushRequest,
  StkPushResponse,
  NormalizedCallbackResult,
  TransactionStatusQuery,
  NormalizedStatusResult,
  SupportedPaymentProvider
} from './payment-provider.interface.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { BadRequestError } from '../../errors/AppError.js';
import { darajaService } from '../daraja.service.js';

export class PayHeroAdapter implements IPaymentProvider {
  readonly providerName: SupportedPaymentProvider = 'payhero';

  private getBaseUrl(): string {
    return env.PAYHERO_BASE_URL || 'https://backend.payhero.co.ke/api/v2';
  }

  private getAuthHeader(): string {
    const username = env.PAYHERO_API_USERNAME || '';
    const password = env.PAYHERO_API_PASSWORD || '';
    return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
  }

  /**
   * Initiates Lipa Na M-Pesa STK Push via PayHero API v2
   */
  async initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    const formattedPhone = darajaService.formatPhoneNumber(request.phoneNumber);
    const channelId = Number(env.PAYHERO_CHANNEL_ID) || 0;
    const callbackUrl =
      env.PAYHERO_CALLBACK_URL ||
      `${env.STAGING_FRONTEND_URL || 'https://mwancha-senior-community-msc-production.up.railway.app'}/api/v1/payments/payhero/callback`;

    // Simulated response for development/testing when credentials are mock or empty, or simulation mode is explicitly enabled
    const isMockCredentials =
      !env.PAYHERO_API_USERNAME ||
      !env.PAYHERO_API_PASSWORD ||
      env.PAYHERO_API_USERNAME === 'your_payhero_username' ||
      channelId === 0;

    if (env.PAYMENT_SIMULATION_MODE || isMockCredentials) {
      logger.warn('Executing PayHero STK Push in development simulation mode.');
      const mockRef = `PH_SIM_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

      return {
        provider: this.providerName,
        providerTransactionId: mockRef,
        checkoutRequestId: mockRef,
        merchantRequestId: `PH_CH_${channelId}`,
        responseCode: '0',
        responseDescription: 'Payment request accepted by PayHero (Simulation)',
        customerMessage: 'Please enter your M-Pesa PIN on your phone to complete payment.',
        rawResponse: {
          success: true,
          status: 'success',
          reference: mockRef,
          external_reference: request.referenceCode,
          simulated: true
        }
      };
    }

    const payload = {
      amount: Math.round(request.amount),
      phone_number: formattedPhone,
      channel_id: channelId,
      provider: 'm-pesa',
      external_reference: request.referenceCode,
      customer_name: request.customerName,
      callback_url: callbackUrl
    };

    const url = `${this.getBaseUrl()}/payments`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = (await response.json()) as any;

      if (!response.ok || (data.status && data.status !== 'success' && !data.success)) {
        logger.error({ status: response.status, data }, 'PayHero STK Push rejected');
        const errorMessage = data.error_message || data.message || data.error || 'Failed to initiate M-Pesa prompt via PayHero.';

        // Automatic fallback to simulation in development mode if merchant account is inactive
        if (
          env.NODE_ENV === 'development' &&
          (errorMessage.includes('Merchant Account Inactive') || data.error_code === 'permission_denied')
        ) {
          logger.warn(
            { errorMessage },
            'PayHero live account is inactive. Auto-switching to simulated development mode so local testing can proceed.'
          );
          const mockRef = `PH_SIM_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
          return {
            provider: this.providerName,
            providerTransactionId: mockRef,
            checkoutRequestId: mockRef,
            merchantRequestId: `PH_CH_${channelId}`,
            responseCode: '0',
            responseDescription: 'Payment request simulated (PayHero account awaiting activation)',
            customerMessage: 'Simulated prompt: Local testing active while PayHero account awaits activation.',
            rawResponse: {
              success: true,
              status: 'success',
              reference: mockRef,
              external_reference: request.referenceCode,
              simulated: true
            }
          };
        }

        throw new BadRequestError(errorMessage);
      }

      const reference = data.reference || data.payment_id || `PH-${Date.now()}`;

      return {
        provider: this.providerName,
        providerTransactionId: reference,
        checkoutRequestId: reference,
        merchantRequestId: String(channelId),
        responseCode: '0',
        responseDescription: data.message || 'Payment request initiated successfully',
        customerMessage: 'Payment prompt dispatched. Please check your phone.',
        rawResponse: data
      };
    } catch (err: any) {
      logger.error({ err }, 'Error during PayHero STK Push execution');
      throw err;
    }
  }

  /**
   * Parses and normalizes incoming PayHero payment callback webhook
   */
  async parseCallback(
    payload: Record<string, any>,
    headers?: Record<string, any>
  ): Promise<NormalizedCallbackResult> {
    logger.info({ payload }, 'Received PayHero webhook callback notification');

    // Webhook security verification if secret key configured
    if (env.PAYHERO_WEBHOOK_SECRET && !this.validateWebhookSecurity(payload, headers)) {
      logger.warn('PayHero webhook HMAC signature validation failed');
      return {
        provider: this.providerName,
        isSuccessful: false,
        isCancelled: false,
        providerReference: '',
        amount: 0,
        resultCode: 'INVALID_SIGNATURE',
        resultDesc: 'HMAC signature verification failed',
        rawPayload: payload
      };
    }

    const success = Boolean(payload.success === true || payload.status === 'success');
    const statusStr = String(payload.status || '').toLowerCase();
    const isCancelled = statusStr === 'cancelled' || statusStr.includes('cancel');
    const isFailed = !success && !isCancelled;

    const referenceCode = payload.external_reference || payload.referenceCode;
    const providerTransactionId = payload.reference || payload.transaction_id;
    const providerReference = payload.provider_reference || payload.mpesa_reference || '';
    const amount = Number(payload.amount || 0);

    return {
      provider: this.providerName,
      isSuccessful: success,
      isCancelled,
      referenceCode,
      checkoutRequestId: providerTransactionId,
      providerTransactionId,
      providerReference: providerReference || (success ? `PH-${Date.now()}` : ''),
      amount,
      phoneNumber: payload.phone_number || payload.PhoneNumber,
      resultCode: success ? 0 : isCancelled ? 1032 : 1,
      resultDesc: payload.message || (success ? 'Success' : isCancelled ? 'User cancelled' : 'Payment failed'),
      metadata: payload,
      rawPayload: payload
    };
  }

  /**
   * Queries PayHero for transaction state
   */
  async queryStatus(query: TransactionStatusQuery): Promise<NormalizedStatusResult> {
    const reference = query.providerTransactionId || query.checkoutRequestId || query.referenceCode;

    if (!reference) {
      return {
        provider: this.providerName,
        status: 'PENDING',
        resultDesc: 'Missing transaction reference for PayHero status inquiry'
      };
    }

    if (
      !env.PAYHERO_API_USERNAME ||
      !env.PAYHERO_API_PASSWORD ||
      env.PAYHERO_API_USERNAME === 'your_payhero_username'
    ) {
      return {
        provider: this.providerName,
        status: 'SUCCESSFUL',
        providerReference: `PH_MOCK_${reference}`,
        resultCode: 0,
        resultDesc: 'Simulated PayHero success query'
      };
    }

    const url = `${this.getBaseUrl()}/payments?reference=${encodeURIComponent(reference)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        return {
          provider: this.providerName,
          status: 'PENDING',
          resultDesc: data.message || 'Unable to retrieve status from PayHero'
        };
      }

      const item = Array.isArray(data) ? data[0] : data;
      const isSuccess = item?.status === 'success';
      const isCancelled = item?.status === 'cancelled';
      const isFailed = item?.status === 'failed';

      return {
        provider: this.providerName,
        status: isSuccess ? 'SUCCESSFUL' : isCancelled ? 'CANCELLED' : isFailed ? 'FAILED' : 'PENDING',
        providerReference: item?.provider_reference || item?.mpesa_reference,
        resultCode: isSuccess ? 0 : 1,
        resultDesc: item?.message || 'Status query completed',
        amount: Number(item?.amount || 0),
        rawResponse: data
      };
    } catch (err: any) {
      logger.warn({ err }, 'PayHero status query network error');
      return {
        provider: this.providerName,
        status: 'PENDING',
        resultDesc: err.message || 'Status query failed'
      };
    }
  }

  /**
   * Validates PayHero webhook HMAC signature (HMAC-SHA512)
   */
  validateWebhookSecurity(payload: Record<string, any>, headers?: Record<string, any>): boolean {
    const secret = env.PAYHERO_WEBHOOK_SECRET;
    if (!secret) return true; // Signature enforcement optional if secret not configured

    const signature =
      headers?.['x-payhero-signature'] ||
      headers?.['signature'] ||
      headers?.['x-webhook-signature'];

    if (!signature) {
      logger.warn('PayHero webhook missing signature header');
      return false;
    }

    try {
      const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
      const computedHash = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

      const sigBuf = Buffer.from(signature, 'utf8');
      const compBuf = Buffer.from(computedHash, 'utf8');

      if (sigBuf.length !== compBuf.length) {
        return false;
      }

      return crypto.timingSafeEqual(sigBuf, compBuf);
    } catch (err) {
      logger.error({ err }, 'Error during PayHero HMAC signature verification');
      return false;
    }
  }
}

export const payHeroAdapter = new PayHeroAdapter();
