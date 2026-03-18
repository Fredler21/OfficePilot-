import { NextRequest } from 'next/server';
import { apiSuccess, apiError, getUserId } from '@/lib/api';
import { getDb, migrate } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { NotFoundError, ValidationError } from '@/lib/errors';

let migrated = false;

export async function POST(request: NextRequest) {
  try {
    if (!migrated) { migrate(); migrated = true; }

    const body = await request.json();
    const { previewId } = body as { previewId: string };

    if (!previewId) {
      throw new ValidationError('previewId is required');
    }

    const db = getDb();
    const preview = db.prepare('SELECT * FROM action_previews WHERE id = ?').get(previewId) as Record<string, unknown> | undefined;

    if (!preview) {
      throw new NotFoundError('Preview not found');
    }

    if (preview.status !== 'pending') {
      throw new ValidationError(`Preview already ${preview.status}`);
    }

    db.prepare("UPDATE action_previews SET status = 'applied' WHERE id = ?").run(previewId);

    // Log the action
    const userId = getUserId(request);
    db.prepare(
      `INSERT INTO audit_logs (id, user_id, session_id, action, details) VALUES (?, ?, ?, ?, ?)`
    ).run(uuid(), userId, preview.session_id, 'action_applied', JSON.stringify({ previewId, actionType: preview.action_type }));

    return apiSuccess({ previewId, status: 'applied' });
  } catch (err) {
    return apiError(err);
  }
}
