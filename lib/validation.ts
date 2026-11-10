import { z } from 'zod';

export const MAX_TITLE_CHARS = 200;
export const MAX_CONTENT_CHARS = 500_000;

export const titleSchema = z
  .string({ invalid_type_error: 'Title must be text.' })
  .trim()
  .min(1, 'Title cannot be empty.')
  .max(MAX_TITLE_CHARS, `Title must be ${MAX_TITLE_CHARS} characters or fewer.`);

export const createDocumentSchema = z.object({
  title: titleSchema.optional(),
});

export const updateDocumentSchema = z
  .object({
    title: titleSchema.optional(),
    content: z
      .string({ invalid_type_error: 'Content must be text.' })
      .max(MAX_CONTENT_CHARS, 'This document is too large to save.')
      .optional(),
  })
  .refine((d) => d.title !== undefined || d.content !== undefined, {
    message: 'Nothing to update.',
  });

export const shareSchema = z.object({
  email: z.string({ required_error: 'Enter an email address.' }).trim().toLowerCase().email('Enter a valid email address.'),
});

export const unshareSchema = z.object({
  userId: z.string().min(1, 'Missing user.'),
});

export const sessionSchema = z.object({
  userId: z.string().min(1, 'Choose a user.'),
});
