import { z } from 'zod';

export const getPageBySlugSchema = z.object({
    params: z.object({
        slug: z.string().min(1, 'Slug is required'),
    }),
});

export const getPageSchema = z.object({
    params: z.object({
        identifier: z.string().min(1, 'Identifier (ID or Slug) is required'),
    }),
});


