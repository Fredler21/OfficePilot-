import { NextRequest } from 'next/server';
import { apiSuccess, apiError, requireAdminKey } from '@/lib/api';
import { getDb, migrate } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    requireAdminKey(request);
    migrate();

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);

    const logs = db
      .prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?')
      .all(limit);

    return apiSuccess({ logs, count: (logs as unknown[]).length });
  } catch (err) {
    return apiError(err);
  }
}
