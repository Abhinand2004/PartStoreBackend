import express from 'express';
import { getBlogPosts, getBlogPostBySlug, getBlogPostById, createBlogPost } from './blog-controller.js';
import { protect, admin } from '../../middleware/auth-middleware.js';
import { validate } from '../../middleware/validate-middleware.js';
import { createBlogPostSchema, getBlogPostBySlugSchema, getBlogPostByIdSchema, getBlogPostsSchema } from './blog-validation.js';

const router = express.Router();

router.route('/')
    .get(validate(getBlogPostsSchema), getBlogPosts)
    .post(protect, admin, validate(createBlogPostSchema), createBlogPost);

router.route('/:id')
    .get(validate(getBlogPostByIdSchema), getBlogPostById);

router.route('/slug/:slug')
    .get(validate(getBlogPostBySlugSchema), getBlogPostBySlug);

export default router;
