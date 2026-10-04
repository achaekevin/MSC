import { z } from 'zod';

export const contactSubmissionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please provide a valid email address').toLowerCase().trim(),
  phone: z.string().max(30).optional().or(z.literal('')),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(10, 'Message must be at least 10 characters').max(3000),
  consent: z.boolean().default(true).refine(val => val === true, 'You must consent to communications from MSC')
});

export const volunteerApplicationSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
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
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters').max(150),
  contactPerson: z.string().min(2, 'Contact person name must be at least 2 characters').max(100),
  email: z.string().email('Valid email is required').toLowerCase().trim(),
  phone: z.string().min(8, 'Valid phone number is required').max(30),
  organizationType: z.string().min(2, 'Organization type is required').max(80),
  partnershipInterests: z.string().min(2, 'Area of partnership interest is required').max(150),
  message: z.string().min(10, 'Please describe your partnership proposal').max(3000),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  consent: z.boolean().default(true).refine(val => val === true, 'You must consent to partnership evaluation by MSC')
}));

export const formStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'UNDER_REVIEW', 'CONTACTED', 'ACCEPTED', 'DECLINED', 'APPROVED', 'ARCHIVED']),
  reviewNotes: z.string().max(1000).optional()
});

export const contactStatusUpdateSchema = z.object({
  status: z.enum(['NEW', 'READ', 'REPLIED', 'ARCHIVED']),
  internalNotes: z.string().max(1000).optional()
});
