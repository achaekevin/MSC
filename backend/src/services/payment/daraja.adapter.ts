import {
  IPaymentProvider,
  StkPushRequest,
  StkPushResponse,
  NormalizedCallbackResult,
  TransactionStatusQuery,
  NormalizedStatusResult,
  SupportedPaymentProvider
} from './payment-provider.interface.js';
import { darajaService } from '../daraja.service.js';
import { logger } from '../../config/logger.js';
import { env } from '../../config/env.js';

export class DarajaAdapter implements IPaymentProvider {
  readonly providerName: SupportedPaymentProvider = 'daraja';

  /**
   * Initiates Lipa Na M-Pesa Online STK Push via Safaricom Daraja
   */
  async initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    const rawResult = await darajaService.initiateStkPush({
      phoneNumber: request.phoneNumber,
      amount: request.amount,
      referenceCode: request.referenceCode,
      description: request.description
    });

    return {
      provider: this.providerName,
      merchantRequestId: rawResult.merchantRequestId,
      checkoutRequestId: rawResult.checkoutRequestId,
      providerTransactionId: rawResult.checkoutRequestId,
      responseCode: rawResult.responseCode,
      responseDescription: rawResult.responseDescription,
      customerMessage: rawResult.customerMessage,
      rawResponse: rawResult as any
    };
  }

  /**
   * Parses and normalizes incoming Safaricom Daraja STK Push webhook callback
   */
  async parseCallback(
    payload: Record<string, any>,
    _headers?: Record<string, any>
  ): Promise<NormalizedCallbackResult> {
    const callback = payload?.Body?.stkCallback;

    if (!callback) {
      logger.warn({ payload }, 'Invalid Daraja callback structure received');
      return {
        provider: this.providerName,
        isSuccessful: false,
        isCancelled: false,
        providerReference: '',
        amount: 0,
        resultCode: 1,
        resultDesc: 'Invalid payload structure: missing Body.stkCallback',
        rawPayload: payload
      };
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callback;
    const isSuccessful = ResultCode === 0;
    const isCancelled = ResultCode === 1032;

    let mpesaReceipt = '';
    let paidAmount = 0;
    let phoneNumber = '';

    if (isSuccessful && callback.CallbackMetadata?.Item) {
      const items = callback.CallbackMetadata.Item;
      for (const item of items) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = String(item.Value);
        if (item.Name === 'Amount') paidAmount = Number(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      }
    }

    return {
      provider: this.providerName,
      isSuccessful,
      isCancelled,
      checkoutRequestId: CheckoutRequestID,
      providerTransactionId: CheckoutRequestID,
      providerReference: mpesaReceipt || (isSuccessful ? `DAR-${Date.now()}` : ''),
      amount: paidAmount,
      phoneNumber,
      resultCode: ResultCode,
      resultDesc: ResultDesc || (isSuccessful ? 'Success' : 'Transaction failed or cancelled'),
      metadata: callback,
      rawPayload: payload
    };
  }

  /**
   * Queries Safaricom Daraja for real-time status of an STK Push
   */
  async queryStatus(query: TransactionStatusQuery): Promise<NormalizedStatusResult> {
    const checkoutRequestId = query.checkoutRequestId || query.providerTransactionId;

    if (!checkoutRequestId) {
      return {
        provider: this.providerName,
        status: 'PENDING',
        resultDesc: 'Missing checkoutRequestId for status query'
      };
    }

    const queryResult = await darajaService.queryStkStatus(checkoutRequestId);
    const isSuccess = queryResult.resultCode === '0';
    const isCancelled = queryResult.resultCode === '1032';

    let status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'CANCELLED' = 'PENDING';
    if (isSuccess) {
      status = 'SUCCESSFUL';
    } else if (isCancelled) {
      status = 'CANCELLED';
    } else if (queryResult.resultCode && queryResult.resultCode !== '0') {
      status = 'FAILED';
    }

    return {
      provider: this.providerName,
      status,
      resultCode: queryResult.resultCode,
      resultDesc: queryResult.resultDesc,
      rawResponse: queryResult as any
    };
  }

  /**
   * Validates Daraja callback security.
   * Checks optional webhook secret token query parameter if configured.
   */
  validateWebhookSecurity(payload: Record<string, any>, headers?: Record<string, any>): boolean {
    // If a webhook secret token is configured in env, verify it matches
    const expectedSecret = env.MPESA_CALLBACK_SECRET || env.DARAJA_CALLBACK_SECRET;
    if (expectedSecret) {
      const token = headers?.['x-daraja-token'] || headers?.['x-webhook-token'];
      if (token && token !== expectedSecret) {
        logger.warn('Daraja callback rejected: invalid webhook secret token');
        return false;
      }
    }
    return true;
  }
}

export const darajaAdapter = new DarajaAdapter();
