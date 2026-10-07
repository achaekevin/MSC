import { z } from 'zod';
import { SpamDetector } from '../utils/spamDetector.js';

// Common anti-spam and honeypot validation fields
const spamFields = {
  website_hp: z.string().optional(),
  hp_confirm: z.string().optional(),
  bot_trap: z.string().optional(),
  fax_number: z.string().optional(),
  _formStartTime: z.union([z.number(), z.string()]).optional(),
  challengeToken: z.string().optional(),
  challengeAnswer: z.union([z.string(), z.number()]).optional(),
  turnstileToken: z.string().optional()
};

const safeEmailSchema = (requiredMessage = 'Valid email is required') =>
  z.string()
    .email(requiredMessage)
    .toLowerCase()
    .trim()
    .refine(
      (email) => !SpamDetector.isDisposableEmail(email),
      'Disposable and temporary email addresses are not permitted. Please use your permanent email address.'
    );

export const contactSubmissionSchema = z.object({
  ...spamFields,
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: safeEmailSchema('Please provide a valid email address'),
  phone: z.string().max(30).optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
  consent: z.boolean().default(true).refine(val => val === true, 'You must consent to communications from MSC')
});

export const volunteerApplicationSchema = z.object({
  ...spamFields,
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: safeEmailSchema('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required').max(30),
  county: z.string().min(2, 'County is required').max(50),
  subCounty: z.string().max(50).optional().or(z.literal('')),
  areaOfInterest: z.string().min(2, 'Area of interest is required').max(100),
  availability: z.string().min(2, 'Availability is required').max(100),
  experience: z.string().max(2000).optional().or(z.literal('')),
  message: z.string().min(10, 'Please tell us why you wish to volunteer').max(3000),
  consent: z.boolean().default(true).refine(val => val === true, 'You must agree to our volunteer code of conduct & safeguarding principles')
});

export const partnershipApplicationSchema = z.preprocess((data: any) => {
  if (data && typeof data === 'object') {
    return {
      ...data,
      organizationName: data.organizationName || data.organization,
      partnershipInterests: data.partnershipInterests || data.areaOfInterest,
      consent: data.consent !== undefined ? data.consent : true
    };
  }
  return data;
}, z.object({
  ...spamFields,
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(150),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters').max(100),
  email: safeEmailSchema('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required').max(30),
  organizationType: z.string().min(2, 'Organization type is required').max(80),
  partnershipInterests: z.string().min(2, 'Area of partnership interest is required').max(150),
  message: z.string().min(10, 'Please describe your partnership proposal').max(3000),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  consent: z.boolean().default(true).refine(val => val === true, 'You must consent to partnership evaluation by MSC')
}));

export const inKindDonationSchema = z.object({
  ...spamFields,
  fullName: z.string().min(2, 'Full name or organization must be at least 2 characters').max(150),
  email: safeEmailSchema('Valid email is required'),
  phone: z.string().min(8, 'Valid phone number is required').max(30),
  donorType: z.string().max(80).optional().default('Individual'),
  donationCategory: z.string().min(2, 'Donation category is required').max(100),
  itemDescription: z.string().min(5, 'Please describe the food items or materials').max(3000),
  estimatedQuantity: z.string().max(100).optional().or(z.literal('')),
  deliveryMethod: z.string().min(2, 'Delivery or drop-off method is required').max(100),
  pickupAddress: z.string().max(300).optional().or(z.literal('')),
  preferredDate: z.string().max(50).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  consent: z.boolean().default(true).refine(val => val === true, 'You must consent to donation processing terms')
});

export const formStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'UNDER_REVIEW', 'CONTACTED', 'ACCEPTED', 'DECLINED', 'APPROVED', 'ARCHIVED']),
  reviewNotes: z.string().max(1000).optional()
});

export const contactStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']),
  internalNotes: z.string().max(1000).optional()
});
