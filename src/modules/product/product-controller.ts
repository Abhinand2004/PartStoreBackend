import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Fetch all products with specific fields
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;
    let whereClause = {};

    if (categoryId && /^\d+$/.test(categoryId)) {
      // Resolve category ID to slug in 'product_cat' taxonomy
      const term = await prisma.terms.findUnique({
        where: { term_id: Number(categoryId) }
      });

      if (term) {
        whereClause = {
          products_terms: {
            some: {
              term_slug: term.slug,
              taxonomy: 'product_cat'
            }
          }
        };
      }
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        price: true,
        featuredImage_url: true,
        seo_title: true,
        seo_description: true,
      },
      take: 50, // Added take limit for performance
    });

    const mappedProducts = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.title,
      content: p.content,
      excerpt: p.excerpt,
      price: p.price,
      image: p.featuredImage_url,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
    }));

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Fetch single product by slug
// @route   GET /api/v1/products/slug/:slug
// @access  Public
export const getProductBySlug = async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug as string },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/v1/products/:id
// @access  Public
export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Fetch best selling products
// @route   GET /api/v1/products/best-sellers
// @access  Public
export const getBestSellers = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        metadata_total_sales: 'desc',
      },
      take: 15,
      select: {
        id: true,
        slug: true,
        title: true, // as name
        price: true,
        featuredImage_url: true, // as image
        seo_title: true,
        seo_description: true,
      },
    });

    // Map to include renamed fields for the frontend
    const mappedProducts = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.title,
      price: p.price,
      image: p.featuredImage_url,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
    }));

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Create a product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { id, title, slug, content, excerpt, seo_title, seo_description, categories } = req.body;

    const product = await prisma.product.create({
      data: {
        id,
        title,
        slug,
        content,
        excerpt,
        seo_title,
        seo_description,
        categories,
        author: req.user!.id.toString(), // Use author as string mapping the user ID
      },
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
};

// @desc    Fetch latest products (optionally by category)
// @route   GET /api/v1/products/latest
// @access  Public
export const getLatestProducts = async (req: Request, res: Response) => {
  try {
    const categoryId = req.query.category as string | undefined;
    let whereClause = {};

    if (categoryId) {
      let filterSlug = categoryId;
      if (/^\d+$/.test(categoryId)) {
        // Resolve category ID to slug in 'product_cat' taxonomy
        const term = await prisma.terms.findUnique({
          where: { term_id: Number(categoryId) }
        });

        if (term) {
          filterSlug = term.slug;
        }
      }

      whereClause = {
        products_terms: {
          some: {
            term_slug: filterSlug,
            taxonomy: 'product_cat'
          }
        }
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: {
        date: 'desc',
      },
      take: 5,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        featuredImage_url: true,
      },
    });

    const mappedProducts = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.title,
      price: p.price,
      image: p.featuredImage_url,
    }));

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

// @desc    Search products
// @route   GET /api/v1/products/search
// @access  Public
export const searchProducts = async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string | undefined;

    if (!query) {
      return res.json([]);
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { slug: { contains: query, mode: 'insensitive' } },
          { sku: { contains: query, mode: 'insensitive' } },
          { tags: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
        featuredImage_url: true,
        seo_title: true,
        seo_description: true,
      },
    });

    const mappedProducts = products.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.title,
      price: p.price,
      image: p.featuredImage_url,
      seo_title: p.seo_title,
      seo_description: p.seo_description,
    }));

    res.json(mappedProducts);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};
