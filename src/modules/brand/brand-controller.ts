import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get all brands
// @route   GET /api/v1/brands
// @access  Public
export const getBrands = async (req: Request, res: Response) => {
    try {
        // 1. Dynamically find root parent(s) named "Car Spare Parts" or "Car Spare Parts Shop"
        const rootTerms = await prisma.terms.findMany({
            where: {
                OR: [
                    { name: { equals: 'Car Spare Parts', mode: 'insensitive' } },
                    { name: { equals: 'Car Spare Parts Shop', mode: 'insensitive' } }
                ]
            },
            select: { term_id: true }
        });

        const rootIds = rootTerms.map(r => r.term_id);

        // 2. Fetch all categories that are children of these roots
        const brandCategories = await prisma.terms.findMany({
            where: {
                taxonomy: 'category',
                parent: { in: rootIds }
            }
        });

        if (brandCategories.length === 0) {
            return res.json([]);
        }

        // Filter out generic names that are not actually brands (e.g., "Genuine Spare Parts")
        const filteredBrands = brandCategories.filter(b =>
            !b.name?.toLowerCase().includes('genuine') &&
            !b.name?.toLowerCase().includes('spare parts shop')
        );

        // 3. Format response with images and counts
        const brandsWithData = await Promise.all(filteredBrands.map(async (brand) => {
            // Find image in media matching name or slug
            const media = await prisma.media.findFirst({
                where: {
                    OR: [
                        { title: { contains: brand.name!, mode: 'insensitive' } },
                        { attached_file: { contains: brand.slug, mode: 'insensitive' } }
                    ]
                },
                select: { attached_file: true }
            });

            // Count unique existing blog posts associated with this brand slug
            const blogsCount = await prisma.blogPost.count({
                where: {
                    blog_posts_terms: {
                        some: {
                            term_slug: brand.slug,
                            taxonomy: 'category'
                        }
                    }
                }
            });

            return {
                id: brand.term_id,
                name: brand.name,
                slug: brand.slug,
                image: media?.attached_file || null,
                count: blogsCount
            };
        }));

        // If there were any other categories requested or missing, 
        // we could potentially add a secondary search here, but the 
        // "Car Spare Parts" children cover the primary car makes.

        res.json(brandsWithData);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};
