import { z } from 'zod';

export const createProductSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        categoryId: z.string().min(1, 'Category ID is required'),
    }),
});

export const getProductByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a numeric string').transform(Number),
    }),
});

export const getProductBySlugSchema = z.object({
    params: z.object({
        slug: z.string().min(1, 'Slug is required'),
    }),
});

export const searchProductsSchema = z.object({
    query: z.object({
        q: z.string().optional(),
    }),
});

export const getLatestProductsSchema = z.object({
    query: z.object({
        category: z.string().optional(),
    }),
});

