import { describe, it, expect, beforeEach, vi } from 'vitest';
import crypto from 'crypto';
import { paymentOrchestrator } from '../src/services/payment/payment.orchestrator.js';
import { darajaAdapter } from '../src/services/payment/daraja.adapter.js';
import { payHeroAdapter } from '../src/services/payment/payhero.adapter.js';
import { env } from '../src/config/env.js';

describe('Configurable M-Pesa Payment Gateway Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Payment Orchestrator Provider Resolution', () => {
    it('should resolve configured active provider by default', () => {
      const active = paymentOrchestrator.getActiveProvider();
      expect(active.providerName).toBe(env.PAYMENT_PROVIDER);
    });

    it('should resolve provider by specific key', () => {
      const daraja = paymentOrchestrator.getProvider('daraja');
      const payhero = paymentOrchestrator.getProvider('payhero');

      expect(daraja.providerName).toBe('daraja');
      expect(payhero.providerName).toBe('payhero');
    });

    it('should gracefully fallback to active provider for unknown provider string', () => {
      const unknown = paymentOrchestrator.getProvider('unsupported_gateway');
      expect(unknown.providerName).toBe(env.PAYMENT_PROVIDER);
    });

    it('should validate provider configuration without throwing in development', () => {
      expect(() => paymentOrchestrator.validateConfiguration()).not.toThrow();
    });
  });

  describe('Safaricom Daraja Adapter Callbacks & Normalization', () => {
    it('should accurately parse and normalize a successful Daraja STK callback', async () => {
      const mockDarajaSuccessPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-1',
            CheckoutRequestID: 'ws_CO_19122026102553097',
            ResultCode: 0,
            ResultDesc: 'The service request is processed successfully.',
            CallbackMetadata: {
              Item: [
                { Name: 'Amount', Value: 1500.0 },
                { Name: 'MpesaReceiptNumber', Value: 'QGH71AA89K' },
                { Name: 'Balance' },
                { Name: 'TransactionDate', Value: 20261019102558 },
                { Name: 'PhoneNumber', Value: 254712345678 }
              ]
            }
          }
        }
      };

      const normalized = await darajaAdapter.parseCallback(mockDarajaSuccessPayload);

      expect(normalized.provider).toBe('daraja');
      expect(normalized.isSuccessful).toBe(true);
      expect(normalized.isCancelled).toBe(false);
      expect(normalized.resultCode).toBe(0);
      expect(normalized.checkoutRequestId).toBe('ws_CO_19122026102553097');
      expect(normalized.providerReference).toBe('QGH71AA89K');
      expect(normalized.amount).toBe(1500);
      expect(normalized.phoneNumber).toBe('254712345678');
    });

    it('should accurately parse a customer-cancelled Daraja transaction (ResultCode 1032)', async () => {
      const mockDarajaCancelPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: '29115-34620561-2',
            CheckoutRequestID: 'ws_CO_19122026102553098',
            ResultCode: 1032,
            ResultDesc: 'Request cancelled by user.'
          }
        }
      };

      const normalized = await darajaAdapter.parseCallback(mockDarajaCancelPayload);

      expect(normalized.provider).toBe('daraja');
      expect(normalized.isSuccessful).toBe(false);
      expect(normalized.isCancelled).toBe(true);
      expect(normalized.resultCode).toBe(1032);
      expect(normalized.providerReference).toBe('');
    });

    it('should safely handle malformed or missing Daraja callback payloads', async () => {
      const normalized = await darajaAdapter.parseCallback({});

      expect(normalized.isSuccessful).toBe(false);
      expect(normalized.resultCode).toBe(1);
      expect(normalized.resultDesc).toContain('missing Body.stkCallback');
    });

    it('should validate Daraja webhook secret token when configured', () => {
      const secret = 'test-daraja-token-123';
      (env as any).MPESA_CALLBACK_SECRET = secret;

      const valid = darajaAdapter.validateWebhookSecurity({}, { 'x-daraja-token': secret });
      const invalid = darajaAdapter.validateWebhookSecurity({}, { 'x-daraja-token': 'wrong-token' });

      expect(valid).toBe(true);
      expect(invalid).toBe(false);

      delete (env as any).MPESA_CALLBACK_SECRET;
    });
  });

  describe('PayHero Kenya Adapter Callbacks & Normalization', () => {
    it('should accurately parse and normalize a successful PayHero webhook callback', async () => {
      const mockPayHeroSuccessPayload = {
        success: true,
        status: 'success',
        reference: 'PH_2026_TX99823',
        external_reference: 'MSC-PUB-17389201-99A1',
        amount: 2500,
        phone_number: '254712345678',
        provider_reference: 'NLJ81RT554',
        message: 'Payment received successfully'
      };

      const normalized = await payHeroAdapter.parseCallback(mockPayHeroSuccessPayload);

      expect(normalized.provider).toBe('payhero');
      expect(normalized.isSuccessful).toBe(true);
      expect(normalized.isCancelled).toBe(false);
      expect(normalized.resultCode).toBe(0);
      expect(normalized.referenceCode).toBe('MSC-PUB-17389201-99A1');
      expect(normalized.checkoutRequestId).toBe('PH_2026_TX99823');
      expect(normalized.providerReference).toBe('NLJ81RT554');
      expect(normalized.amount).toBe(2500);
      expect(normalized.phoneNumber).toBe('254712345678');
    });

    it('should accurately parse a cancelled PayHero transaction', async () => {
      const mockPayHeroCancelPayload = {
        success: false,
        status: 'cancelled',
        reference: 'PH_2026_TX99824',
        external_reference: 'MSC-DON-17389202-88B2',
        amount: 500,
        phone_number: '254712345678',
        message: 'Transaction cancelled by customer'
      };

      const normalized = await payHeroAdapter.parseCallback(mockPayHeroCancelPayload);

      expect(normalized.provider).toBe('payhero');
      expect(normalized.isSuccessful).toBe(false);
      expect(normalized.isCancelled).toBe(true);
      expect(normalized.resultCode).toBe(1032);
    });

    it('should verify PayHero HMAC-SHA512 webhook signature when configured', () => {
      const secret = 'super-secret-payhero-hmac-key';
      (env as any).PAYHERO_WEBHOOK_SECRET = secret;

      const payload = {
        success: true,
        reference: 'PH_SEC_123',
        amount: 1000
      };
      const rawBody = JSON.stringify(payload);
      const validSig = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

      const isValid = payHeroAdapter.validateWebhookSecurity(payload, {
        'x-payhero-signature': validSig
      });
      const isInvalid = payHeroAdapter.validateWebhookSecurity(payload, {
        'x-payhero-signature': 'bad_signature_hex_12345'
      });
      const isMissing = payHeroAdapter.validateWebhookSecurity(payload, {});

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
      expect(isMissing).toBe(false);

      delete (env as any).PAYHERO_WEBHOOK_SECRET;
    });

    it('should generate simulated STK Push response in development mode', async () => {
      const origUser = env.PAYHERO_API_USERNAME;
      (env as any).PAYHERO_API_USERNAME = '';

      try {
        const result = await payHeroAdapter.initiateStkPush({
          phoneNumber: '0712345678',
          amount: 500,
          referenceCode: 'MSC-PUB-TEST-001',
          description: 'Test Publication Purchase',
          customerName: 'Jane Reader',
          customerEmail: 'jane@example.com'
        });

        expect(result.provider).toBe('payhero');
        expect(result.responseCode).toBe('0');
        expect(result.checkoutRequestId).toBeDefined();
        expect(result.checkoutRequestId).toMatch(/^PH_/);
      } finally {
        (env as any).PAYHERO_API_USERNAME = origUser;
      }
    });
  });

  describe('Cross-Provider Safe Switching & Isolation', () => {
    it('should parse Daraja callback through orchestrator regardless of active provider', async () => {
      const darajaPayload = {
        Body: {
          stkCallback: {
            MerchantRequestID: 'DAR-M-1',
            CheckoutRequestID: 'DAR-C-1',
            ResultCode: 0,
            CallbackMetadata: {
              Item: [{ Name: 'MpesaReceiptNumber', Value: 'REC12345' }, { Name: 'Amount', Value: 100 }]
            }
          }
        }
      };

      const normalized = await paymentOrchestrator.parseCallback('daraja', darajaPayload);
      expect(normalized.provider).toBe('daraja');
      expect(normalized.isSuccessful).toBe(true);
      expect(normalized.providerReference).toBe('REC12345');
    });

    it('should parse PayHero callback through orchestrator regardless of active provider', async () => {
      const payHeroPayload = {
        success: true,
        status: 'success',
        reference: 'PH-REF-99',
        provider_reference: 'MPESA-PH-88',
        amount: 300
      };

      const normalized = await paymentOrchestrator.parseCallback('payhero', payHeroPayload);
      expect(normalized.provider).toBe('payhero');
      expect(normalized.isSuccessful).toBe(true);
      expect(normalized.providerReference).toBe('MPESA-PH-88');
    });
  });
});
