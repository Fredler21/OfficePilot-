import { NextRequest } from 'next/server';
import { apiSuccess, apiError, getUserId } from '@/lib/api';
import { parseFile } from '@/lib/context';
import { getDb, migrate } from '@/lib/db';
import { v4 as uuid } from 'uuid';
import { getConfig } from '@/lib/config';
import { ValidationError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  try {
    migrate();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const sessionId = formData.get('sessionId') as string | null;

    if (!file) {
      throw new ValidationError('No file uploaded');
    }

    const config = getConfig();
    const maxBytes = config.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new ValidationError(`File too large. Maximum size is ${config.MAX_FILE_SIZE_MB}MB`);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseFile(buffer, file.name);

    const userId = getUserId(request);
    const fileId = uuid();
    const db = getDb();

    db.prepare(
      `INSERT INTO file_records (id, session_id, user_id, filename, file_type, file_size, parsed_context)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(fileId, sessionId, userId, file.name, parsed.type, file.size, JSON.stringify(parsed));

    return apiSuccess({
      fileId,
      filename: file.name,
      type: parsed.type,
      sections: parsed.sections.length,
      metadata: parsed.metadata,
      context: parsed.sections.map((s) => ({
        type: s.type,
        title: s.title,
        preview: s.content.substring(0, 200),
      })),
    });
  } catch (err) {
    return apiError(err);
  }
}
