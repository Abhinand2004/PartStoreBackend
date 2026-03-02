import express from 'express';
import { getPageBySlug, getPage } from './page-controller.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getPageBySlugSchema, getPageSchema } from './page-validation.js';

const router = express.Router();

router.route('/slug/:slug')
    .get(validate(getPageBySlugSchema), getPageBySlug);

router.route('/:identifier')
    .get(validate(getPageSchema), getPage);

export default router;

