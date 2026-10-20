export type SupportedPaymentProvider = 'daraja' | 'payhero';

export interface StkPushRequest {
  phoneNumber: string;       // Formatted as 254XXXXXXXXX
  amount: number;            // In KES
  referenceCode: string;     // Internal MSC reference (e.g. MSC-PUB-123456-ABCD)
  description: string;       // Line item description
  customerName: string;
  customerEmail: string;
  metadata?: Record<string, any>;
}

export interface StkPushResponse {
  provider: SupportedPaymentProvider;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  providerTransactionId?: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
  rawResponse: Record<string, any>;
}

export interface NormalizedCallbackResult {
  provider: SupportedPaymentProvider;
  isSuccessful: boolean;
  isCancelled: boolean;
  referenceCode?: string;
  checkoutRequestId?: string;
  providerTransactionId?: string;
  providerReference: string; // M-Pesa receipt number (e.g. QA12BC34DE)
  amount: number;
  phoneNumber?: string;
  resultCode: string | number;
  resultDesc: string;
  metadata?: Record<string, any>;
  rawPayload: Record<string, any>;
}

export interface TransactionStatusQuery {
  checkoutRequestId?: string;
  merchantRequestId?: string;
  providerTransactionId?: string;
  referenceCode?: string;
}

export interface NormalizedStatusResult {
  provider: SupportedPaymentProvider;
  status: 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'CANCELLED';
  providerReference?: string;
  resultCode?: string | number;
  resultDesc?: string;
  amount?: number;
  rawResponse?: Record<string, any>;
}

export interface IPaymentProvider {
  readonly providerName: SupportedPaymentProvider;
  initiateStkPush(request: StkPushRequest): Promise<StkPushResponse>;
  parseCallback(payload: Record<string, any>, headers?: Record<string, any>): Promise<NormalizedCallbackResult>;
  queryStatus(query: TransactionStatusQuery): Promise<NormalizedStatusResult>;
  validateWebhookSecurity?(payload: Record<string, any>, headers?: Record<string, any>): boolean;
}
