import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthError,
  ForbiddenError,
  FileParseError,
  AIProviderError,
  ToolExecutionError,
  toAppError,
} from '@/lib/errors';

describe('Error Hierarchy', () => {
  it('AppError has correct properties', () => {
    const err = new AppError('test', 'TEST_ERROR', 418, { foo: 'bar' });
    expect(err.message).toBe('test');
    expect(err.code).toBe('TEST_ERROR');
    expect(err.statusCode).toBe(418);
    expect(err.details).toEqual({ foo: 'bar' });
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('ValidationError defaults to 400', () => {
    const err = new ValidationError('bad input');
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('NotFoundError defaults to 404', () => {
    const err = new NotFoundError('not here');
    expect(err.statusCode).toBe(404);
  });

  it('AuthError defaults to 401', () => {
    const err = new AuthError();
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Unauthorized');
  });

  it('ForbiddenError defaults to 403', () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
  });

  it('FileParseError defaults to 422', () => {
    const err = new FileParseError('bad file');
    expect(err.statusCode).toBe(422);
  });

  it('AIProviderError defaults to 502', () => {
    const err = new AIProviderError('provider down');
    expect(err.statusCode).toBe(502);
  });

  it('ToolExecutionError defaults to 500', () => {
    const err = new ToolExecutionError('tool broke');
    expect(err.statusCode).toBe(500);
  });

  it('toAppError wraps unknown errors', () => {
    expect(toAppError(new AppError('x'))).toBeInstanceOf(AppError);
    expect(toAppError(new Error('y')).message).toBe('y');
    expect(toAppError('string error').message).toBe('string error');
    expect(toAppError(42).message).toBe('42');
  });
});
