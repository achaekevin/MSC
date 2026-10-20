import { apiClient } from './api';

export interface InitiatePurchaseRequest {
  publicationId: string;
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
}

export interface InitiateDonationRequest {
  amount: number;
  phoneNumber: string;
  donorName?: string;
  donorEmail?: string;
  donorType?: 'INDIVIDUAL' | 'CORPORATE' | 'FOUNDATION';
  message?: string;
  isAnonymous?: boolean;
}

export interface PaymentInitiationResponse {
  success: boolean;
  referenceCode: string;
  checkoutRequestId?: string;
  amount: number;
  currency: string;
  message: string;
}

export interface PaymentStatusResponse {
  referenceCode: string;
  status: 'PENDING' | 'INITIATED' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED' | 'REVERSED';
  category: 'PUBLICATION_PURCHASE' | 'DONATION' | 'SPONSORSHIP';
  amount: number;
  currency: string;
  providerReference?: string;
  completedAt?: string;
  customerEmail?: string;
  receiptNumber?: string;
  publication?: {
    id: string;
    title: string;
    slug: string;
    coverImage?: string;
  };
  downloadToken?: string;
  message: string;
}

export interface FinancialSummaryResponse {
  netRevenue: number;
  currency: string;
  categories: {
    publicationSales: { total: number; currency: string };
    donations: { total: number; currency: string };
    sponsorships: { total: number; onlineTotal: number; reconciledOfflineTotal: number; currency: string };
  };
  counts: {
    successful: number;
    pending: number;
    failed: number;
    total: number;
  };
  pendingAmount: number;
  failedAmount: number;
}

export type FinancialSummary = FinancialSummaryResponse;

export interface TransactionItem {
  id: string;
  referenceCode: string;
  provider: string;
  category: string;
  amount: number;
  currency: string;
  phoneNumber?: string;
  customerPhone?: string;
  payerName?: string;
  customerName?: string;
  payerEmail?: string;
  customerEmail?: string;
  status: string;
  providerReference?: string;
  initiatedAt: string;
  createdAt?: string;
  completedAt?: string;
  details?: string;
  notes?: string;
}

export type PaymentTransactionItem = TransactionItem;

class PaymentService {
  private baseEndpoint = '/payments';

  // Initiate publication purchase via M-Pesa STK push
  async initiatePublicationPurchase(data: InitiatePurchaseRequest): Promise<PaymentInitiationResponse> {
    return apiClient.post(`${this.baseEndpoint}/purchase/initiate`, data);
  }

  // Initiate instant M-Pesa donation via STK push
  async initiateDonation(data: InitiateDonationRequest): Promise<PaymentInitiationResponse> {
    return apiClient.post(`${this.baseEndpoint}/donation/initiate`, data);
  }

  // Check real-time status of payment (for polling in modal)
  async getPaymentStatus(referenceCode: string): Promise<PaymentStatusResponse> {
    return apiClient.get(`${this.baseEndpoint}/status/${referenceCode}`);
  }

  // Admin: Get overall financial KPI summary
  async getFinancialSummary(dateFrom?: string, dateTo?: string): Promise<FinancialSummaryResponse> {
    const query = new URLSearchParams();
    if (dateFrom) query.set('dateFrom', dateFrom);
    if (dateTo) query.set('dateTo', dateTo);
    const qs = query.toString();
    return apiClient.get(`${this.baseEndpoint}/admin/summary${qs ? `?${qs}` : ''}`);
  }

  // Admin: Get transactions ledger
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{ items: TransactionItem[]; transactions: TransactionItem[]; pagination: any }> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);
    if (params?.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params?.dateTo) query.set('dateTo', params.dateTo);
    const qs = query.toString();
    const res = await apiClient.get<any>(`${this.baseEndpoint}/admin/transactions${qs ? `?${qs}` : ''}`);
    const items = Array.isArray(res) ? res : res.items || [];
    return {
      items,
      transactions: items,
      pagination: res.pagination || null
    };
  }

  // Admin: Download CSV of verified financial records
  async downloadTransactionsCsv(dateFrom?: string, dateTo?: string): Promise<Blob> {
    const query = new URLSearchParams();
    if (dateFrom) query.set('dateFrom', dateFrom);
    if (dateTo) query.set('dateTo', dateTo);
    const qs = query.toString();
    const apiUrl = import.meta.env.VITE_API_URL || '/api/v1';

    const token = localStorage.getItem('msc_access_token');
    const response = await fetch(`${apiUrl}${this.baseEndpoint}/admin/export${qs ? `?${qs}` : ''}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });

    if (!response.ok) {
      throw new Error('Failed to export transactions CSV');
    }

    return response.blob();
  }

  // Admin: Download CSV and trigger browser file save
  async downloadExportCsv(params?: {
    category?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<void> {
    const blob = await this.downloadTransactionsCsv(params?.dateFrom, params?.dateTo);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `msc-financial-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  // View & Print Official Digital Receipt
  async downloadReceiptPdf(referenceCode: string): Promise<void> {
    const status = await this.getPaymentStatus(referenceCode);
    const printWindow = window.open('', '_blank', 'width=750,height=900');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to view your official receipt.');
      return;
    }

    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${status.referenceCode} - Mwancha Senior Community</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1c1917; }
          .header { text-align: center; border-bottom: 2px solid #14532d; padding-bottom: 20px; margin-bottom: 24px; }
          .title { font-size: 22px; font-weight: 800; color: #14532d; margin: 0; }
          .subtitle { font-size: 13px; color: #78716c; margin-top: 4px; }
          .badge { display: inline-block; padding: 4px 12px; background: #ecfdf5; color: #047857; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; font-size: 13px; }
          .grid div { padding: 10px; background: #fafaf9; border-radius: 8px; }
          .grid strong { display: block; font-size: 11px; color: #78716c; text-transform: uppercase; }
          .total { font-size: 20px; font-weight: 800; color: #14532d; text-align: right; padding: 16px; background: #f0fdf4; border-radius: 8px; margin-bottom: 24px; }
          .footer { font-size: 11px; color: #a8a29e; text-align: center; border-top: 1px solid #e7e5e4; padding-top: 20px; margin-top: 30px; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">MWANCHA SENIOR COMMUNITY</h1>
          <div class="subtitle">Official Charitable Payment & Tax Acknowledgment</div>
          <div class="badge">Status: ${status.status}</div>
        </div>
        <div class="grid">
          <div><strong>Receipt / Reference Code</strong>${status.referenceCode}</div>
          <div><strong>M-Pesa Transaction Ref</strong>${status.providerReference || 'Pending Confirmation'}</div>
          <div><strong>Transaction Category</strong>${status.category.replace('_', ' ')}</div>
          <div><strong>Date & Time</strong>${status.completedAt ? new Date(status.completedAt).toLocaleString() : new Date().toLocaleString()}</div>
        </div>
        ${status.publication ? `
        <div style="padding: 12px; background: #fafaf9; border-radius: 8px; margin-bottom: 16px; font-size: 13px;">
          <strong style="display:block;font-size:11px;color:#78716c;text-transform:uppercase;">Licensed Publication</strong>
          ${status.publication.title}
        </div>
        ` : ''}
        <div class="total">Amount Received: ${status.currency} ${status.amount.toLocaleString()}</div>
        <p style="font-size: 12px; line-height: 1.6; color: #44403c;">
          Thank you for supporting Mwancha Senior Community. This digital receipt serves as official proof of payment and tax-deductible contribution or authorized digital copyright access.
        </p>
        <div class="footer">
          Mwancha Senior Community • Kenya • mwanchaseniorcommunity@gmail.com<br/>
          Registered Non-Profit Community Trust &copy; ${new Date().getFullYear()}
        </div>
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 24px; background: #14532d; color: white; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">
            Print / Save as PDF
          </button>
        </div>
      </body>
      </html>
    `;
    printWindow.document.write(receiptHtml);
    printWindow.document.close();
  }
}

export const paymentService = new PaymentService();
