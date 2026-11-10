import { describe, expect, it } from 'vitest';
import { shareSchema, titleSchema, updateDocumentSchema } from '@/lib/validation';

describe('input validation', () => {
  it('rejects empty or whitespace-only titles', () => {
    expect(titleSchema.safeParse('   ').success).toBe(false);
    expect(titleSchema.parse('  My doc  ')).toBe('My doc');
  });

  it('rejects very long titles', () => {
    expect(titleSchema.safeParse('x'.repeat(201)).success).toBe(false);
  });

  it('requires at least one field when updating a document', () => {
    expect(updateDocumentSchema.safeParse({}).success).toBe(false);
    expect(updateDocumentSchema.safeParse({ content: '<p>hi</p>' }).success).toBe(true);
  });

  it('normalises share emails and rejects invalid ones', () => {
    expect(shareSchema.parse({ email: '  Bob@Ajaia.TEST ' }).email).toBe('bob@ajaia.test');
    expect(shareSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
  });
});
