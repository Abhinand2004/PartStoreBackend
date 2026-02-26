import express from 'express';
import { getCart, updateCart } from './cart-controller.js';
import { protect } from '../../middleware/auth-middleware.js';

const router = express.Router();

router.route('/').get(protect, getCart).put(protect, updateCart);

export default router;
