import { describe, it, expect, vi } from 'vitest';
import { darajaService } from '../src/services/daraja.service.js';
import { paymentService } from '../src/services/payment.service.js';
import { publicationService } from '../src/services/publication.service.js';
import { sponsorshipService } from '../src/services/sponsorship.service.js';
import { PaymentStatus, PaymentCategory, PublicationAccessType } from '@prisma/client';

describe('Revenue Generation & Digital Commerce Tests', () => {
  describe('Safaricom Daraja Phone Normalization', () => {
    it('should correctly normalize standard Kenyan 07XX numbers', () => {
      const normalized = darajaService.formatPhoneNumber('0712345678');
      expect(normalized).toBe('254712345678');
    });

    it('should correctly normalize 01XX Safaricom/Airtel numbers', () => {
      const normalized = darajaService.formatPhoneNumber('0112345678');
      expect(normalized).toBe('254112345678');
    });

    it('should correctly normalize international format numbers +2547XXXXXXXX', () => {
      const normalized = darajaService.formatPhoneNumber('+254790629439');
      expect(normalized).toBe('254790629439');
    });

    it('should reject invalid or truncated phone numbers', () => {
      expect(() => darajaService.formatPhoneNumber('12345')).toThrow();
      expect(() => darajaService.formatPhoneNumber('07123')).toThrow();
    });
  });

  describe('Reference Code Generation', () => {
    it('should generate non-colliding human-readable references', () => {
      const ref1 = paymentService.generateReferenceCode('PUB');
      const ref2 = paymentService.generateReferenceCode('PUB');
      const donRef = paymentService.generateReferenceCode('DON');
      const sponRef = paymentService.generateReferenceCode('SPON');

      expect(ref1).toMatch(/^MSC-PUB-\d+-[A-Z0-9]+$/);
      expect(donRef).toMatch(/^MSC-DON-\d+-[A-Z0-9]+$/);
      expect(sponRef).toMatch(/^MSC-SPON-\d+-[A-Z0-9]+$/);
      expect(ref1).not.toBe(ref2);
    });
  });

  describe('Publication Access & Entitlement Model', () => {
    it('should seed default publications and distinguish FREE from PAID', async () => {
      await publicationService.ensureDefaultPublicationsSeeded();
      const publicList = await publicationService.getPublicPublications();

      expect(publicList.length).toBeGreaterThanOrEqual(2);

      const freePub = publicList.find(p => p.accessType === PublicationAccessType.FREE);
      const paidPub = publicList.find(p => p.accessType === PublicationAccessType.PAID);

      expect(freePub).toBeDefined();
      expect(paidPub).toBeDefined();

      if (freePub) {
        expect(freePub.isPaid).toBe(false);
        expect(freePub.price).toBe(0);
      }

      if (paidPub) {
        expect(paidPub.isPaid).toBe(true);
        expect(paidPub.price).toBeGreaterThan(0);
      }
    });

    it('should mask full document chapters for unpurchased paid publications', async () => {
      const paidSlug = 'grassroots-elder-care-and-case-management-manual';
      const singlePub = await publicationService.getPublicPublicationBySlug(paidSlug);

      expect(singlePub.isPaid).toBe(true);
      expect(singlePub.isEntitled).toBe(false);
      // Chapters must only contain sample excerpt, not full private document
      expect(singlePub.chapters.length).toBe(1);
      expect(singlePub.chapters[0].title).toContain('Excerpt');
    });

    it('should allow full chapters for free publications without purchase barrier', async () => {
      const freeSlug = 'dignified-ageing-in-kenya-strategic-blueprint';
      const singlePub = await publicationService.getPublicPublicationBySlug(freeSlug);

      expect(singlePub.isPaid).toBe(false);
      expect(singlePub.isEntitled).toBe(true);
      expect(singlePub.chapters.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Corporate Sponsorship Pipeline', () => {
    it('should record an institutional sponsorship enquiry with valid reference and status', async () => {
      const result = await sponsorshipService.createEnquiry({
        organizationName: 'Kenya Geriatric Healthcare Alliance',
        contactPerson: 'Dr. Jane Moraa',
        contactEmail: 'jmoraa@example.org',
        contactPhone: '0722000000',
        tier: 'GOLD',
        proposedAmount: 350000,
        notes: 'Interest in co-sponsoring medical screening camps in Nyamira County.'
      });

      expect(result.success).toBe(true);
      expect(result.referenceNumber).toMatch(/^MSC-SPON-\d+$/);
      expect(result.sponsorshipId).toBeDefined();
    });
  });
});
