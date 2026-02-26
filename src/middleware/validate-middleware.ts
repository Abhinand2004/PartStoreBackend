import type { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate = (schema: z.ZodObject<any, any>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        return next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                message: 'Validation Error',
                errors: error.issues.map((err: any) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
