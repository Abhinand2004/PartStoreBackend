import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
export const getCategories = async (req: Request, res: Response) => {
  try {
    // 1. Fetch all terms that could be categories
    // We fetch all product_cat terms, but also potentially their parents from other taxonomies
    const allProductCats = await prisma.terms.findMany({
      where: { taxonomy: 'product_cat' }
    });

    const categoryMap = new Map();
    const allTermIds = new Set(allProductCats.map(cat => cat.term_id));

    // Identify potential parents from other taxonomies (e.g., product_tag)
    const externalParentIds = [...new Set(
      allProductCats
        .map(cat => cat.parent)
        .filter((id): id is number => id !== null && !allTermIds.has(id))
    )];

    let externalParents: any[] = [];
    if (externalParentIds.length > 0) {
      externalParents = await prisma.terms.findMany({
        where: { term_id: { in: externalParentIds } }
      });
    }

    // 2. Fetch thumbnail and product count metadata for all found terms
    const termIds = [...allTermIds, ...externalParentIds];
    const metaEntries = await prisma.term_meta.findMany({
      where: {
        term_id: { in: termIds },
        meta_key: { in: ['thumbnail_id', 'product_count_product_cat'] }
      }
    });

    const thumbnails = metaEntries.filter(m => m.meta_key === 'thumbnail_id');
    const productCounts = metaEntries.filter(m => m.meta_key === 'product_count_product_cat');

    // 3. Fetch media files for the thumbnails
    const mediaIds = thumbnails
      .map(t => parseInt(t.meta_value || '0'))
      .filter(id => id > 0);

    const mediaFiles = await prisma.media.findMany({
      where: { id: { in: mediaIds } },
      select: { id: true, attached_file: true }
    });

    const mediaMap = new Map(mediaFiles.map(m => [m.id, m.attached_file]));
    const termImageMap = new Map();
    thumbnails.forEach(t => {
      const mediaId = parseInt(t.meta_value || '0');
      if (mediaId > 0 && mediaMap.has(mediaId)) {
        termImageMap.set(t.term_id, mediaMap.get(mediaId));
      }
    });

    const termCountMap = new Map();
    productCounts.forEach(pc => {
      termCountMap.set(pc.term_id, parseInt(pc.meta_value || '0'));
    });

    // 4. (Removed product fetching logic - no longer needed)

    // 5. Build lookup maps for re-parenting
    // Some product_cat terms point to a product_tag parent with the same name.
    // We map those tag IDs to the corresponding product_cat IDs using case-insensitive name matching or slug matching.
    const tagToCatMap = new Map<number, number>();
    externalParents.forEach(parent => {
      const parentNameLower = parent.name?.toLowerCase();
      const parentSlug = parent.slug?.toLowerCase();

      const matchingCat = allProductCats.find(c =>
        (c.name?.toLowerCase() === parentNameLower) ||
        (c.slug?.toLowerCase() === parentSlug)
      );

      if (matchingCat) {
        tagToCatMap.set(parent.term_id, matchingCat.term_id);
      }
    });

    // 6. Initialize all categories in the map
    allProductCats.forEach(cat => {
      categoryMap.set(cat.term_id, {
        term_id: cat.term_id,
        name: cat.name?.replace(/&amp;/g, '&'), // Clean HTML entities
        slug: cat.slug,
        parent: cat.parent,
        count: termCountMap.get(cat.term_id) || 0,
        image: termImageMap.get(cat.term_id) || null,
        subcategories: [] // Initialize empty subcategories array
      });
    });

    // 7. Build hierarchy and collect root categories
    allProductCats.forEach(cat => {
      const catData = categoryMap.get(cat.term_id);
      let parentId = cat.parent;

      // Re-parent if the parent is a tag that has a category equivalent
      if (parentId !== null && tagToCatMap.has(parentId)) {
        parentId = tagToCatMap.get(parentId)!;
        catData.parent = parentId;
      }

      // If we have a valid parent within our category map, add this as a subcategory
      if (parentId !== null && categoryMap.has(parentId)) {
        const parentData = categoryMap.get(parentId);
        parentData.subcategories.push(catData);
      }
    });

    const rootCategories: any[] = [];

    // 8. Collect final root categories (active categories with no active parents)
    allProductCats.forEach(cat => {
      const catData = categoryMap.get(cat.term_id);
      const parentId = catData.parent;

      // Check if it's a root category (no parent or parent not in our category system)
      if (parentId === null || !categoryMap.has(parentId)) {
        // Filter subcategories: only count > 0 and map specific fields
        const filteredSubcategories = catData.subcategories
          .filter((sub: any) => sub.count > 0)
          .map((sub: any) => ({
            id: sub.term_id,
            name: sub.name,
            slug: sub.slug
          }));

        // Update catData with filtered subcategories
        const finalCatData = {
          ...catData,
          subcategories: filteredSubcategories
        };

        // Only include root categories that have a product count > 0 or have active subcategories
        if (finalCatData.count > 0 || finalCatData.subcategories.length > 0) {
          rootCategories.push(finalCatData);
        }
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
