import express from 'express';
import { getCart, updateCart } from './cart-controller.js';
import { protect } from '../../middleware/auth-middleware.js';
import { validate } from '../../middleware/validate-middleware.js';
import { getCartSchema, updateCartSchema } from './cart-validation.js';

const router = express.Router();

router.route('/')
    .get(protect, validate(getCartSchema), getCart)
    .put(protect, validate(updateCartSchema), updateCart);

export default router;
