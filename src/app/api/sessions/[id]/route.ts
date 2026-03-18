import { NextRequest } from 'next/server';
import { apiSuccess, apiError, getUserId } from '@/lib/api';
import { sessionStore } from '@/lib/session';
import { migrate } from '@/lib/db';

let migrated = false;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!migrated) { migrate(); migrated = true; }

    const session = sessionStore.getSession(params.id);
    if (!session) {
      return apiError({ message: 'Session not found', code: 'NOT_FOUND', statusCode: 404 });
    }

    const userId = getUserId(request);
    if (session.userId !== userId) {
      return apiError({ message: 'Forbidden', code: 'FORBIDDEN', statusCode: 403 });
    }

    const messages = sessionStore.getMessages(params.id);

    return apiSuccess({
      session,
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    return apiError(err);
  }
}
