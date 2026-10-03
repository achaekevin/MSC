import { describe, it, expect } from 'vitest';
import {
  contactSubmissionSchema,
  volunteerApplicationSchema,
  partnershipApplicationSchema
} from '../src/schemas/form.schema.js';

describe('Form Validation Schemas (Section 22, 23, 24, 36)', () => {
  describe('Contact Form Validation', () => {
    it('should validate valid contact submission', () => {
      const valid = {
        name: 'Grace Kemunto',
        email: 'grace@example.com',
        phone: '+254711223344',
        subject: 'Inquiry on Elderly Care Services',
        message: 'I would like to inquire about home support for my grandmother.',
        consent: true
      };

      const result = contactSubmissionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email and missing consent', () => {
      const invalid = {
        name: 'Grace',
        email: 'not-an-email',
        subject: 'Hi',
        message: 'Too short',
        consent: false
      };

      const result = contactSubmissionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const fields = result.error.errors.map(e => e.path[0]);
        expect(fields).toContain('email');
        expect(fields).toContain('subject');
        expect(fields).toContain('message');
        expect(fields).toContain('consent');
      }
    });
  });

  describe('Volunteer Application Validation', () => {
    it('should validate complete volunteer application', () => {
      const valid = {
        fullName: 'John Omwamba',
        email: 'john@example.com',
        phone: '+254722334455',
        county: 'Nyamira',
        subCounty: 'Manga',
        areaOfInterest: 'Home Visits & Needs Mapping',
        availability: 'Weekends',
        experience: '2 years community health promoter',
        message: 'I am committed to elder dignity and intergenerational community care.',
        consent: true
      };

      const result = volunteerApplicationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject volunteer application missing required county or phone', () => {
      const invalid = {
        fullName: 'J',
        email: 'john@example.com',
        message: 'Help',
        consent: true
      };

      const result = volunteerApplicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Partnership Application Validation', () => {
    it('should validate institutional proposal', () => {
      const valid = {
        organizationName: 'Kenya Geriatric Health Foundation',
        contactPerson: 'Dr. Evans Mogaka',
        email: 'mogaka@example.org',
        phone: '+254733445566',
        organizationType: 'Healthcare NGO',
        partnershipInterests: 'Geriatric Medical Screenings & SHA Advocacy',
        message: 'We wish to collaborate with MSC on mobile clinics in Nyamira County.',
        consent: true
      };

      const result = partnershipApplicationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });
  });
});
