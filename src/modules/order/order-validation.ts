import { z } from 'zod';

export const addOrderItemsSchema = z.object({
    body: z.object({
        orderItems: z.array(z.object({
            name: z.string().min(1),
            qty: z.number().int().min(1),
            image: z.string().optional(),
            price: z.number().min(0),
            productId: z.number().int(),
        })).min(1, 'Order items are required'),
        shippingAddr: z.string().min(1, 'Shipping address is required'),
        paymentMethod: z.string().min(1, 'Payment method is required'),
        itemsPrice: z.number().min(0),
        taxPrice: z.number().min(0),
        shippingPrice: z.number().min(0),
        totalPrice: z.number().min(0),
    }),
});

export const getOrderByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Order ID is required'),
    }),
});
