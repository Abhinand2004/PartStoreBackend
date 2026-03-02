import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// Helper: parse comma-separated or JSON string into an array of strings
function parseToArray(value: string | null | undefined): string[] {
    if (!value) return [];
    // Try JSON array first
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed.map(String);
    } catch { }
    // Fall back to comma-separated
    return value.split(',').map(s => s.trim()).filter(Boolean);
}

// Helper: format a blog post for API response
function formatPost(post: any) {
    return {
        ...post,
        featuredImage_url: post.featuredImage_url || post.featuredImage || null,
        categories: parseToArray(post.categories),
        tags: parseToArray(post.tags),
    };
}

// @desc    Get latest blog posts (optionally filtered by brand ID)
// @route   GET /api/v1/blogs/latest?brandId=ID
// @access  Public
export const getLatestBlogs = async (req: Request, res: Response) => {
    try {
        const { brandId } = req.query;
        let whereClause: any = {};

        if (brandId) {
            const term = await prisma.terms.findUnique({
                where: { term_id: Number(brandId) }
            });

            if (term) {
                whereClause = {
                    blog_posts_terms: {
                        some: {
                            term_slug: term.slug,
                            taxonomy: { in: ['pa_brand', 'category'] }
                        }
                    }
                };
            } else {
                return res.json([]); // Brand not found
            }
        }

        const posts = await prisma.blogPost.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: 5,
        });

        const formattedPosts = posts.map(formatPost);

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get all blog posts (with optional category or brand filter)
// @route   GET /api/v1/blogs?category=slug or GET /api/v1/blogs?brand=slug
// @access  Public
export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string | undefined;
        const brand = req.query.brand as string | undefined;
        const tag = req.query.tag as string | undefined;

        let filters: any[] = [];

        if (tag) {
            let tagSlug = tag;
            if (/^\d+$/.test(tag)) {
                const term = await prisma.terms.findUnique({ where: { term_id: Number(tag) } });
                if (term) tagSlug = term.slug;
            }
            filters.push({
                blog_posts_terms: { some: { term_slug: tagSlug, taxonomy: 'post_tag' } }
            });
        }

        if (category) {
            let catSlug = category;
            if (/^\d+$/.test(category)) {
                const term = await prisma.terms.findUnique({ where: { term_id: Number(category) } });
                if (term) catSlug = term.slug;
            }
            filters.push({
                blog_posts_terms: { some: { term_slug: catSlug, taxonomy: 'category' } }
            });
        }

        if (brand) {
            let brandSlug = brand;
            if (/^\d+$/.test(brand)) {
                const term = await prisma.terms.findUnique({ where: { term_id: Number(brand) } });
                if (term) brandSlug = term.slug;
            }
            filters.push({
                blog_posts_terms: { some: { term_slug: brandSlug, taxonomy: { in: ['pa_brand', 'category'] } } }
            });
        }

        let whereClause: any = filters.length > 0 ? { AND: filters } : {};

        const posts = await prisma.blogPost.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
        });

        const formattedPosts = posts.map(formatPost);

        res.json(formattedPosts);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get single blog post by slug
// @route   GET /api/v1/blogs/slug/:slug
// @access  Public
export const getBlogPostBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const post = await prisma.blogPost.findFirst({
            where: { slug: slug as string }
        });

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        const formattedPost = formatPost(post);

        res.json(formattedPost);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get single blog post by ID
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid ID' });
        }
        const post = await prisma.blogPost.findUnique({
            where: { id }
        });

        if (!post) {
            return res.status(404).json({ message: 'Blog post not found' });
        }

        const formattedPost = formatPost(post);

        res.json(formattedPost);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Create a blog post
// @route   POST /api/v1/blogs
// @access  Private/Admin
export const createBlogPost = async (req: Request, res: Response) => {
    const blogPostData = req.body;
    const post = await prisma.blogPost.create({
        data: blogPostData,
    });
    res.status(201).json(post);
};
