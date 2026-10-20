import {
  IPaymentProvider,
  StkPushRequest,
  StkPushResponse,
  NormalizedCallbackResult,
  TransactionStatusQuery,
  NormalizedStatusResult,
  SupportedPaymentProvider
} from './payment-provider.interface.js';
import { darajaAdapter } from './daraja.adapter.js';
import { payHeroAdapter } from './payhero.adapter.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { BadRequestError } from '../../errors/AppError.js';

export class PaymentOrchestrator {
  private adapters: Map<SupportedPaymentProvider, IPaymentProvider> = new Map();

  constructor() {
    this.adapters.set('daraja', darajaAdapter);
    this.adapters.set('payhero', payHeroAdapter);
  }

  /**
   * Retrieves the currently active payment provider based on environment configuration
   */
  getActiveProvider(): IPaymentProvider {
    const providerKey = (env.PAYMENT_PROVIDER || 'daraja').toLowerCase() as SupportedPaymentProvider;
    const adapter = this.adapters.get(providerKey);

    if (!adapter) {
      logger.error({ configuredProvider: env.PAYMENT_PROVIDER }, 'Configured payment provider is unsupported');
      throw new BadRequestError(`Unsupported payment provider: ${env.PAYMENT_PROVIDER}. Allowed: 'daraja' | 'payhero'`);
    }

    return adapter;
  }

  /**
   * Retrieves a specific provider adapter by name (used for routing historical callbacks)
   */
  getProvider(name: string): IPaymentProvider {
    const key = name.toLowerCase().replace('mpesa_', '') as SupportedPaymentProvider;
    const adapter = this.adapters.get(key);

    if (!adapter) {
      logger.warn({ requestedProvider: name }, 'Requested payment provider adapter not found, defaulting to active provider');
      return this.getActiveProvider();
    }

    return adapter;
  }

  /**
   * Initiates STK Push through the currently active payment gateway
   */
  async initiateStkPush(request: StkPushRequest): Promise<StkPushResponse> {
    const provider = this.getActiveProvider();
    logger.info(
      { provider: provider.providerName, referenceCode: request.referenceCode, amount: request.amount },
      'Orchestrating STK Push payment initiation'
    );
    return provider.initiateStkPush(request);
  }

  /**
   * Parses and normalizes incoming webhook callback for the designated provider
   */
  async parseCallback(
    providerName: string,
    payload: Record<string, any>,
    headers?: Record<string, any>
  ): Promise<NormalizedCallbackResult> {
    const provider = this.getProvider(providerName);
    return provider.parseCallback(payload, headers);
  }

  /**
   * Queries status of an in-flight transaction using the transaction's originating provider
   */
  async queryStatus(
    providerName: string,
    query: TransactionStatusQuery
  ): Promise<NormalizedStatusResult> {
    const provider = this.getProvider(providerName);
    return provider.queryStatus(query);
  }

  /**
   * Validates configured credentials at application startup
   */
  validateConfiguration(): void {
    const activeKey = (env.PAYMENT_PROVIDER || 'daraja').toLowerCase() as SupportedPaymentProvider;

    if (activeKey === 'daraja') {
      if (env.NODE_ENV === 'production') {
        const missing: string[] = [];
        if (!env.MPESA_CONSUMER_KEY && !env.DARAJA_CONSUMER_KEY) missing.push('DARAJA_CONSUMER_KEY');
        if (!env.MPESA_CONSUMER_SECRET && !env.DARAJA_CONSUMER_SECRET) missing.push('DARAJA_CONSUMER_SECRET');
        if (!env.MPESA_PASSKEY && !env.DARAJA_PASSKEY) missing.push('DARAJA_PASSKEY');

        if (missing.length > 0) {
          logger.error({ missing }, 'CRITICAL: Active payment provider Daraja lacks required production credentials');
          throw new Error(`Active payment provider Daraja missing required production variables: ${missing.join(', ')}`);
        }
      }
      logger.info('Active payment gateway: Safaricom Daraja API');
    } else if (activeKey === 'payhero') {
      if (env.NODE_ENV === 'production') {
        const missing: string[] = [];
        if (!env.PAYHERO_API_USERNAME) missing.push('PAYHERO_API_USERNAME');
        if (!env.PAYHERO_API_PASSWORD) missing.push('PAYHERO_API_PASSWORD');
        if (!env.PAYHERO_CHANNEL_ID) missing.push('PAYHERO_CHANNEL_ID');

        if (missing.length > 0) {
          logger.error({ missing }, 'CRITICAL: Active payment provider PayHero lacks required production credentials');
          throw new Error(`Active payment provider PayHero missing required production variables: ${missing.join(', ')}`);
        }
      }
      logger.info('Active payment gateway: PayHero Kenya API v2');
    }
  }
}

export const paymentOrchestrator = new PaymentOrchestrator();
