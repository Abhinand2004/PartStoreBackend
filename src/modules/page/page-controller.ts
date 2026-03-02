import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get single page by ID or slug
// @route   GET /api/v1/pages/:identifier
// @access  Public
export const getPage = async (req: Request, res: Response) => {
    try {
        const identifier = req.params.identifier as string;
        const isId = /^\d+$/.test(identifier);

        const page = await prisma.pages.findFirst({
            where: {
                OR: [
                    isId ? { id: Number(identifier) } : { id: -1 },
                    { slug: identifier }
                ]
            },
            include: {
                pages_meta: true
            }
        });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

// @desc    Get single page by slug (legacy)
// @route   GET /api/v1/pages/slug/:slug
// @access  Public
export const getPageBySlug = async (req: Request, res: Response) => {
    try {
        const { slug } = req.params;
        const page = await prisma.pages.findFirst({
            where: {
                slug: slug as string,
                status: 'publish'
            },
            include: {
                pages_meta: true
            }
        });

        if (!page) {
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(page);
    } catch (error) {
        res.status(500).json({ message: (error as Error).message });
    }
};

