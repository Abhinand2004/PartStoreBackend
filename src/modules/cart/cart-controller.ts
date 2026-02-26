import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req: Request, res: Response) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.user.id },
  });
  res.json(cart || { items: [] });
};

// @desc    Update user cart
// @route   PUT /api/v1/cart
// @access  Private
export const updateCart = async (req: Request, res: Response) => {
  const { items } = req.body;
  const cart = await prisma.cart.upsert({
    where: { userId: req.user!.id },
    update: { items },
    create: { userId: req.user!.id, items },
  });
  res.json(cart);
};
