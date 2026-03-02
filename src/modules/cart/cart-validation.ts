import { z } from 'zod';

export const updateCartSchema = z.object({
    body: z.object({
        items: z.array(z.any()).min(1, 'Cart items cannot be empty'),
    }),
});

export const getCartSchema = z.object({
    query: z.object({}).optional(),
});
