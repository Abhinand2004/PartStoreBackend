import express from 'express';
import { getCategories, createCategory } from './category-controller.js';
import { protect, admin } from '../../middleware/auth-middleware.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getCategoriesSchema, createCategorySchema } from './category-validation.js';

const router = express.Router();

router.route('/')
    .get(validate(getCategoriesSchema), getCategories)
    .post(protect, admin, validate(createCategorySchema), createCategory);

export default router;
