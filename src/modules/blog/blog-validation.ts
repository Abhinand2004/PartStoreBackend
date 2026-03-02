import { z } from 'zod';

export const createBlogPostSchema = z.object({
    body: z.object({
        title: z.string().min(1, 'Title is required'),
        slug: z.string().min(1, 'Slug is required'),
        content: z.string().optional(),
        excerpt: z.string().optional(),
        link: z.string().optional(),
        guid: z.string().optional(),
        post_name: z.string().optional(),
        seo_title: z.string().optional(),
        seo_description: z.string().optional(),
        seo_canonical: z.string().optional(),
    }),
});

export const getBlogPostByIdSchema = z.object({
    params: z.object({
        id: z.string().regex(/^\d+$/, 'ID must be a numeric string').transform(Number),
    }),
});

export const getBlogPostBySlugSchema = z.object({
    params: z.object({
        slug: z.string().min(1, 'Slug is required'),
    }),
});

export const getBlogPostsSchema = z.object({
    query: z.object({
        category: z.string().optional(),
        brand: z.string().optional(),
        tag: z.string().optional(),
    }),
});

export const getLatestBlogsSchema = z.object({
    query: z.object({
        brandId: z.string().regex(/^\d+$/, 'Brand ID must be a numeric string').optional(),
    }),
});
