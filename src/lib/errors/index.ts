export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(
    message: string,
    code: string = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

export class AuthError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'AuthError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

export class FileParseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FILE_PARSE_ERROR', 422, details);
    this.name = 'FileParseError';
  }
}

export class AIProviderError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AI_PROVIDER_ERROR', 502, details);
    this.name = 'AIProviderError';
  }
}

export class ToolExecutionError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TOOL_EXECUTION_ERROR', 500, details);
    this.name = 'ToolExecutionError';
  }
}

export function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (err instanceof Error) return new AppError(err.message);
  return new AppError(String(err));
}
