import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get all blog posts (with optional category or brand filter)
// @route   GET /api/v1/blogs?category=slug or GET /api/v1/blogs?brand=slug
// @access  Public
export const getBlogPosts = async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string | undefined;
        const brand = req.query.brand as string | undefined;
        const tag = req.query.tag as string | undefined; // This will be the term_id

        let whereClause: any = {};
        const catFilterValue = category || brand;

        if (tag && /^\d+$/.test(tag)) {
            // Priority: Filter by Tag ID
            const term = await prisma.terms.findUnique({
                where: { term_id: Number(tag) }
            });

            if (term) {
                whereClause = {
                    blog_posts_terms: {
                        some: {
                            term_slug: term.slug,
                            taxonomy: 'post_tag'
                        }
                    }
                };
            }
        } else if (catFilterValue) {
            // Fallback: Filter by Category/Brand
            let catFilterSlug = catFilterValue;
            if (/^\d+$/.test(catFilterValue)) {
                const term = await prisma.terms.findUnique({
                    where: { term_id: Number(catFilterValue) }
                });
                if (term) {
                    catFilterSlug = term.slug;
                }
            }
            whereClause = {
                blog_posts_terms: {
                    some: {
                        term_slug: catFilterSlug,
                        taxonomy: 'category'
                    }
                }
            };
        }

        const posts = await prisma.blogPost.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            select: {
                id: true,
                title: true,
                slug: true,
                content: true,
                date: true,
                link: true,
                seo_title: true,
                seo_description: true,
            }
        });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get single blog post by slug
// @route   GET /api/v1/blogs/slug/:slug
// @access  Public
export const getBlogPostBySlug = async (req: Request, res: Response) => {
    const { slug } = req.params;
    const post = await prisma.blogPost.findFirst({
        where: { slug: slug as string }
    });

    if (!post) {
        res.status(404);
        throw new Error('Blog post not found');
    }

    res.json(post);
};

// @desc    Get single blog post by ID
// @route   GET /api/v1/blogs/:id
// @access  Public
export const getBlogPostById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const post = await prisma.blogPost.findUnique({
            where: { id }
        });

        if (!post) {
            res.status(404);
            throw new Error('Blog post not found');
        }

        res.json(post);
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
