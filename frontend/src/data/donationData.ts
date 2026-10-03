import { DonationMethod } from '../types';

/**
 * SOURCE OF TRUTH NOTICE:
 * In accordance with organizational integrity standards, no bank account numbers,
 * M-Pesa paybills, or payment gateways are invented.
 * These placeholders will be configured once official client financial accounts are accredited.
 */
export const DONATION_METHODS_CONFIG: DonationMethod[] = [
  {
    id: 'donation-mpesa',
    name: 'M-Pesa Mobile Giving',
    type: 'mpesa',
    details: [],
    instructions: 'Official MSC M-Pesa Paybill / Till Number is currently undergoing statutory onboarding and will be published here upon verification.',
    isConfigured: false,
    statusMessage: 'Official M-Pesa channel undergoing verification',
    metadata: {
      status: 'changes_requested',
      source: 'placeholder',
      lastUpdated: '2026-10-03',
      notes: 'Pending client submission of official Safaricom Paybill / Till number credentials.'
    }
  },
  {
    id: 'donation-bank',
    name: 'Direct Bank Wire Transfer',
    type: 'bank',
    details: [],
    instructions: 'Official institutional banking coordinates will be displayed upon formal release by the MSC Board of Management.',
    isConfigured: false,
    statusMessage: 'Bank transfer details to be published upon board approval',
    metadata: {
      status: 'changes_requested',
      source: 'placeholder',
      lastUpdated: '2026-10-03',
      notes: 'Pending client submission of official bank name, branch, and account number.'
    }
  },
  {
    id: 'donation-online',
    name: 'International Credit / Debit Card & Online Giving',
    type: 'online',
    details: [],
    instructions: 'Secure card processing integration is being architected for international supporters and donor partners.',
    isConfigured: false,
    statusMessage: 'Payment gateway integration in progress',
    metadata: {
      status: 'draft',
      source: 'placeholder',
      lastUpdated: '2026-10-03',
      notes: 'Merchant gateway API keys to be configured once compliance is verified.'
    }
  }
];
