import { z } from 'zod';

export const getTagsSchema = z.object({
    query: z.object({}).optional(),
});
