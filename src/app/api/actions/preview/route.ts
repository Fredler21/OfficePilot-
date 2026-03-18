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
    const { sessionId, actionType, description, previewData } = body as {
      sessionId: string;
      actionType: string;
      description: string;
      previewData: unknown;
    };

    if (!sessionId || !actionType || !description) {
      throw new ValidationError('sessionId, actionType, and description are required');
    }

    const db = getDb();
    const id = uuid();
    db.prepare(
      `INSERT INTO action_previews (id, session_id, action_type, description, preview_data)
       VALUES (?, ?, ?, ?, ?)`
    ).run(id, sessionId, actionType, description, JSON.stringify(previewData));

    return apiSuccess({ previewId: id, status: 'pending' });
  } catch (err) {
    return apiError(err);
  }
}
