import express from 'express';
import { addOrderItems, getOrderById } from './order-controller.js';
import { protect } from '../../middleware/auth-middleware.js';
import { validate } from '../../middleware/validate-middleware.js';
import { addOrderItemsSchema, getOrderByIdSchema } from './order-validation.js';

const router = express.Router();

router.route('/')
    .post(protect, validate(addOrderItemsSchema), addOrderItems);

router.route('/:id')
    .get(protect, validate(getOrderByIdSchema), getOrderById);

export default router;
