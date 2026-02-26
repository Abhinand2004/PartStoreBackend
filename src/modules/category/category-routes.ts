import express from 'express';
import { getCategories, createCategory } from './category-controller.js';
import { protect, admin } from '../../middleware/auth-middleware.js';

const router = express.Router();

router.route('/').get(getCategories).post(protect, admin, createCategory);

export default router;
