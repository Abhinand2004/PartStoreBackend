import type { Request, Response } from 'express';
import prisma from '../../config/db.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const addOrderItems = async (req: Request, res: Response) => {
  const {
    orderItems,
    shippingAddr,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400).json({ message: 'No order items' });
    return;
  }

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      shippingAddr,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      orderItems: {
        create: orderItems.map((item: any) => ({
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
          productId: item.productId,
        })),
      },
    },
    include: {
      orderItems: true,
    },
  });

  res.status(201).json(order);
};

// @desc    Get order by ID
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrderById = async (req: Request, res: Response) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { name: true, email: true } },
      orderItems: true,
    },
  });

  if (order) {
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found' });
  }
};
