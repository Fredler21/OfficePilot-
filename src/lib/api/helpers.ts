import { NextResponse } from 'next/server';
import { AppError, toAppError, AuthError } from '@/lib/errors';
import { logger } from '@/lib/logging';
import { getConfig } from '@/lib/config';
import crypto from 'crypto';

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  meta?: Record<string, unknown>;
  warnings?: string[];
  errors?: { code: string; message: string }[];
}

export function apiSuccess<T>(data: T, meta?: Record<string, unknown>): NextResponse<ApiEnvelope<T>> {
  return NextResponse.json({ success: true, data, meta, warnings: [], errors: [] });
}

export function apiError(err: unknown): NextResponse<ApiEnvelope<null>> {
  const appErr = toAppError(err);
  logger.error(appErr.message, { code: appErr.code, statusCode: appErr.statusCode });
  return NextResponse.json(
    {
      success: false,
      data: null,
      errors: [{ code: appErr.code, message: appErr.message }],
    },
    { status: appErr.statusCode }
  );
}

export function requireAdminKey(request: Request): void {
  const config = getConfig();
  const provided = request.headers.get('x-admin-key') ?? '';
  // Timing-safe comparison to prevent timing attacks
  const expected = config.ADMIN_API_KEY;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    throw new AuthError('Invalid admin API key');
  }
}

export function getUserId(request: Request): string {
  // In a real app, this would come from auth middleware (JWT/session)
  // Sanitize to prevent injection - only allow alphanumeric, hyphens, underscores
  const raw = request.headers.get('x-user-id') ?? 'default-user';
  return raw.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64) || 'default-user';
}
