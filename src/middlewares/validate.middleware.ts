import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, type ZodTypeAny } from 'zod';
import { ApiError } from '../utils/api-error.js';

declare module 'express-serve-static-core' {
  interface Request {
    validatedQuery?: unknown;
  }
}

interface ValidationSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

export function validate(schemas: ValidationSchemas): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        req.validatedQuery = schemas.query.parse(req.query);
      }

      if (schemas.params) {
        const parsedParams = schemas.params.parse(req.params);

        Object.assign(req.params, parsedParams);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details = error.issues.map((issue) => ({
          field: issue.path.join('.') || 'request',
          message: issue.message
        }));

        next(ApiError.validation('Request validation failed', details));
        return;
      }

      next(error);
    }
  };
}
