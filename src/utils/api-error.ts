export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'UNPROCESSABLE_ENTITY'
  | 'RATE_LIMITED'
  | 'INTERNAL_SERVER_ERROR';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);

    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    Error.captureStackTrace?.(this, ApiError);
  }

  static validation(message = 'Invalid request data', details?: unknown) {
    return new ApiError(400, 'VALIDATION_ERROR', message, details);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message = 'Resource conflict') {
    return new ApiError(409, 'CONFLICT', message);
  }

  static unprocessable(message = 'Request cannot be processed') {
    return new ApiError(422, 'UNPROCESSABLE_ENTITY', message);
  }

  static internal(message = 'Internal server error') {
    return new ApiError(500, 'INTERNAL_SERVER_ERROR', message);
  }
}
