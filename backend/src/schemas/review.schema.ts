import { z } from 'zod';

export const submitReviewSchema = z.object({
  reviewNotes: z.string().max(1000).optional(),
  changeNote: z.string().max(500).optional()
});

export const requestChangesSchema = z.object({
  reviewNotes: z.string().min(5, 'Review notes specifying required changes are mandatory').max(2000)
});

export const approveContentSchema = z.object({
  reviewNotes: z.string().max(1000).optional()
});

export const publishContentSchema = z.object({
  publishNotes: z.string().max(500).optional()
});

export const clientSignoffSchema = z.object({
  scope: z.string().min(2).max(100).default('FULL_WEBSITE'),
  clientRepresentativeName: z.string().min(2, 'Client representative name is required').max(100),
  clientRepresentativeRole: z.string().min(2, 'Client representative role/position is required').max(100),
  notes: z.string().max(2000).optional(),
  version: z.string().default('1.0.0')
});
