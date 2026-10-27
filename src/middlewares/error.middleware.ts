import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { ApiError } from '../utils/api-error.js';

export function notFoundMiddleware(req: Request, res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.requestId;

  let statusCode = 500;
  let code: string = 'INTERNAL_SERVER_ERROR';
  let message = 'Internal server error';
  let details: unknown;

  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Request validation failed';
    details = error.issues.map((issue) => ({
      field: issue.path.join('.') || 'request',
      message: issue.message
    }));
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Database validation failed';
    details = Object.values(error.errors).map((validationError) => ({
      field: validationError.path,
      message: validationError.message
    }));
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = `Invalid value for ${error.path}`;
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 11000
  ) {
    statusCode = 409;
    code = 'CONFLICT';
    message = 'Duplicate resource detected';
  } else if (error instanceof SyntaxError && 'body' in error) {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Invalid JSON request body';
  }

  if (statusCode >= 500) {
    req.log?.error({ err: error, requestId }, 'Unhandled API error');
  } else {
    req.log?.warn({ err: error, requestId }, 'API request failed');
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined ? { details } : {}),
      ...(env.nodeEnv === 'development' && statusCode >= 500
        ? { stack: error instanceof Error ? error.stack : undefined }
        : {})
    }
  });
}
