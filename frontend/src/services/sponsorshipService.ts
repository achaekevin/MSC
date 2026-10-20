import { apiClient } from './api';

export interface SponsorshipEnquiryInput {
  organizationName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'STRATEGIC';
  proposedAmount?: number;
  websiteUrl?: string;
  notes?: string;
}

export interface PublicSponsorItem {
  id: string;
  organizationName: string;
  tier: string;
  logoUrl?: string;
  websiteUrl?: string;
  campaign?: string;
}

export interface AdminSponsorshipItem {
  id: string;
  organizationName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  tier: string;
  campaign?: string;
  agreedAmount: number;
  amountContracted?: number;
  totalPaid: number;
  amountReconciled?: number;
  balance: number;
  currency: string;
  startDate: string;
  endDate: string;
  status: string;
  logoUrl?: string;
  websiteUrl?: string;
  website?: string;
  isPublicDisplayApproved: boolean;
  agreementReference?: string;
  notes?: string;
  paymentsCount: number;
  createdAt: string;
}

export type PartnerLogoItem = PublicSponsorItem;
export type CorporateSponsorshipItem = AdminSponsorshipItem;

class SponsorshipService {
  private baseEndpoint = '/sponsorships';

  // Public: Submit corporate partnership enquiry
  async submitEnquiry(data: SponsorshipEnquiryInput) {
    return apiClient.post(`${this.baseEndpoint}/enquire`, data);
  }

  // Public: Get approved sponsors for brand display
  async getPublicSponsors(): Promise<PublicSponsorItem[]> {
    return apiClient.get(`${this.baseEndpoint}/partners`);
  }

  // Alias for getPublicSponsors
  async getApprovedSponsors(): Promise<PublicSponsorItem[]> {
    return this.getPublicSponsors();
  }

  // Admin: Get all corporate sponsorships
  async getAdminSponsorships(params?: { status?: string; tier?: string }): Promise<AdminSponsorshipItem[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.tier) query.set('tier', params.tier);
    const qs = query.toString();
    return apiClient.get(`${this.baseEndpoint}/admin/all${qs ? `?${qs}` : ''}`);
  }

  // Admin: Update corporate sponsorship
  async updateSponsorship(id: string, data: Partial<AdminSponsorshipItem>) {
    return apiClient.put(`${this.baseEndpoint}/admin/${id}`, data);
  }

  // Admin / Accountant: Record verified corporate payment
  async recordPayment(sponsorshipId: string, data: {
    amount: number;
    paymentMethod: string;
    referenceNumber: string;
    notes?: string;
  }) {
    return apiClient.post(`${this.baseEndpoint}/admin/${sponsorshipId}/record-payment`, data);
  }

  // Admin / Accountant: Reconcile corporate payment
  async reconcilePayment(sponsorshipId: string, data: {
    amount: number;
    paymentMethod?: string;
    referenceNumber?: string;
    notes?: string;
  }) {
    return this.recordPayment(sponsorshipId, {
      amount: data.amount,
      paymentMethod: data.paymentMethod || 'MANUAL_RECONCILIATION',
      referenceNumber: data.referenceNumber || `REC-${Date.now()}`,
      notes: data.notes
    });
  }
}

export const sponsorshipService = new SponsorshipService();
