import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get all product tags
// @route   GET /api/v1/tags
// @access  Public
export const getTags = async (req: Request, res: Response) => {
    try {
        // 1. Get unique slugs associated with the SEO author
        const postTerms = await prisma.blog_posts_terms.findMany({
            where: {
                taxonomy: 'post_tag',
                blog_posts: {
                    author: 'parstore.ae@gmail.com'
                }
            },
            select: {
                term_slug: true
            }
        });

        const uniqueSlugs = [...new Set(postTerms
            .map(pt => pt.term_slug)
            .filter((slug): slug is string => !!slug)
        )];

        // 2. Fetch the terms corresponding to these slugs
        const tags = await prisma.terms.findMany({
            where: {
                taxonomy: 'post_tag',
                slug: { in: uniqueSlugs }
            },
            orderBy: {
                name: 'asc'
            },
            select: {
                term_id: true,
                name: true,
                slug: true
            }
        });

        // 3. Map fields to requested format
        const mappedTags = tags.map(tag => ({
            id: tag.term_id,
            tagname: tag.name,
            slug: tag.slug
        }));

        res.json(mappedTags);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
