import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function validate(schema: z.ZodObject<any, any>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError: any = new Error('Validation error');
        validationError.name = 'ValidationError';
        validationError.details = error.errors;
        validationError.status = 400;
        return next(validationError);
      }
      next(error);
    }
  };
}
