import { z } from 'zod';

export const getCategoriesSchema = z.object({
    query: z.object({}).optional(),
});

export const createCategorySchema = z.object({
    body: z.object({
        name: z.string().min(1, 'Category name is required'),
        slug: z.string().min(1, 'Category slug is required'),
        parent: z.number().int().nullable().optional(),
    }),
});
