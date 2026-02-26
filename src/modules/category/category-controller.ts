import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all product categories
    const allCategories = await prisma.terms.findMany({
      where: { taxonomy: 'product_cat' }
    });

    // 2. Fetch thumbnail metadata for these categories
    const termIds = allCategories.map(cat => cat.term_id);
    const thumbnails = await prisma.term_meta.findMany({
      where: {
        term_id: { in: termIds },
        meta_key: 'thumbnail_id'
      }
    });

    // 3. Fetch media files for the thumbnails
    const mediaIds = thumbnails
      .map(t => parseInt(t.meta_value || '0'))
      .filter(id => id > 0);

    const mediaFiles = await prisma.media.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, attached_file: true }
    });

    // Create a map for quick media lookup
    const mediaMap = new Map(mediaFiles.map(m => [m.id, m.attached_file]));

    // Create a map for term -> image URL lookup
    const termImageMap = new Map();
    thumbnails.forEach(t => {
      const mediaId = parseInt(t.meta_value || '0');
      if (mediaId > 0 && mediaMap.has(mediaId)) {
        termImageMap.set(t.term_id, mediaMap.get(mediaId));
      }
    });

    // 4. Fetch products associated with these categories
    const categorySlugs = allCategories
      .map(cat => cat.slug)
      .filter((slug): slug is string => slug !== null);

    const categoryProducts = await prisma.products_terms.findMany({
      where: {
        taxonomy: 'product_cat',
        term_slug: { in: categorySlugs }
      },
      select: {
        term_slug: true,
        products: {
          select: {
            title: true
          }
        }
      }
    });

    // Create a map of term_slug -> array of product names
    const categoryProductMap = new Map<string, string[]>();
    categoryProducts.forEach(cp => {
      if (cp.term_slug && cp.products?.title) {
        const names = categoryProductMap.get(cp.term_slug) || [];
        if (!names.includes(cp.products.title)) {
          names.push(cp.products.title);
        }
        categoryProductMap.set(cp.term_slug, names);
      }
    });

    // 5. Build the hierarchical tree
    const categoryMap = new Map();

    // Initialize all categories in the map
    allCategories.forEach(cat => {
      categoryMap.set(cat.term_id, {
        ...cat,
        image: termImageMap.get(cat.term_id) || null,
        productNames: cat.slug ? (categoryProductMap.get(cat.slug) || []) : [],
        subcategories: []
      });
    });

    const rootCategories: any[] = [];

    allCategories.forEach(cat => {
      const catWithSubs = categoryMap.get(cat.term_id);
      if (cat.parent && categoryMap.has(cat.parent)) {
        categoryMap.get(cat.parent).subcategories.push(catWithSubs);
      } else {
        rootCategories.push(catWithSubs);
      }
    });

    res.json(rootCategories);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a category
// @route   POST /api/v1/categories
// @access  Private/Admin
export const createCategory = async (req: Request, res: Response) => {
  res.status(501).json({ message: 'Not implemented: Schema mismatch for category creation' });
};
