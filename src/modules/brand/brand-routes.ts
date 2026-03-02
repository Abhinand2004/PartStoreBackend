import { Router } from 'express';
import { getBrands } from './brand-controller.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getBrandsSchema } from './brand-validation.js';

const router = Router();

router.get('/', validate(getBrandsSchema), getBrands);

export default router;
