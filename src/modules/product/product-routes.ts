import express from 'express';
import { getProducts, getProductBySlug, getProductById, createProduct, getBestSellers, searchProducts, getLatestProducts } from './product-controller.js';
import { protect, admin } from '../../middleware/auth-middleware.js';
import { validate } from '../../middleware/validate-middleware.js';
import { createProductSchema, getProductBySlugSchema, getProductByIdSchema, searchProductsSchema, getLatestProductsSchema } from './product-validation.js';

const router = express.Router();

router.route('/best-sellers').get(getBestSellers);
router.route('/latest').get(validate(getLatestProductsSchema), getLatestProducts);
router.route('/search').get(validate(searchProductsSchema), searchProducts);

router
    .route('/')
    .get(getProducts)
    .post(protect, admin, validate(createProductSchema), createProduct);

router.route('/:id').get(validate(getProductByIdSchema), getProductById);
router.route('/slug/:slug').get(validate(getProductBySlugSchema), getProductBySlug);

export default router;
