import { describe, it, expect } from 'vitest';
import { slugify, generateUniqueSlug } from '../src/utils/slugify.js';

describe('Slugify Utility (Section 68)', () => {
  it('should convert standard text to URL-friendly lowercase slug', () => {
    expect(slugify('Case Management & Home Care')).toBe('case-management-home-care');
    expect(slugify('   Older Persons Protection (2026)   ')).toBe('older-persons-protection-2026');
  });

  it('should remove special characters and consecutive dashes', () => {
    expect(slugify('Dignity, Health --- & Wellbeing!!!')).toBe('dignity-health-wellbeing');
  });

  it('should resolve collision by appending sequential counter', async () => {
    const existing = new Set(['elderly-support', 'elderly-support-2']);
    const checkFn = async (slug: string) => existing.has(slug);

    const generated = await generateUniqueSlug('Elderly Support', checkFn);
    expect(generated).toBe('elderly-support-3');
  });
});
