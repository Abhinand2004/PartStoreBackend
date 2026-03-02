import { z } from 'zod';

export const getBrandsSchema = z.object({
    query: z.object({}).optional(),
});
