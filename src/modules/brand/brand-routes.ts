import { Router } from 'express';
import { getBrands } from './brand-controller.js';

const router = Router();

router.get('/', getBrands);

export default router;
