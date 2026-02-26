import express from 'express';
import { getPageBySlug } from './page-controller.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getPageBySlugSchema } from './page-validation.js';

const router = express.Router();

router.route('/slug/:slug')
    .get(validate(getPageBySlugSchema), getPageBySlug);

export default router;
