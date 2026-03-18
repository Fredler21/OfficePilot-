import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import type { Session, Message, AppMode } from '@/lib/types';

export class SessionStore {
  createSession(userId: string, appMode: AppMode = 'general', language = 'en'): Session {
    const id = uuid();
    const db = getDb();
    db.prepare('INSERT OR IGNORE INTO users (id) VALUES (?)').run(userId);
    db.prepare(
      `INSERT INTO sessions (id, user_id, app_mode, language) VALUES (?, ?, ?, ?)`
    ).run(id, userId, appMode, language);
    return this.getSession(id)!;
  }

  getSession(id: string): Session | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      appMode: row.app_mode as AppMode,
      title: row.title as string | null,
      language: row.language as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  listSessions(userId: string, limit = 50): Session[] {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?')
      .all(userId, limit) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      appMode: row.app_mode as AppMode,
      title: row.title as string | null,
      language: row.language as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  }

  updateSession(id: string, updates: Partial<Pick<Session, 'appMode' | 'title' | 'language'>>) {
    const db = getDb();
    const sets: string[] = [];
    const values: unknown[] = [];
    if (updates.appMode) { sets.push('app_mode = ?'); values.push(updates.appMode); }
    if (updates.title !== undefined) { sets.push('title = ?'); values.push(updates.title); }
    if (updates.language) { sets.push('language = ?'); values.push(updates.language); }
    if (sets.length === 0) return;
    sets.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE sessions SET ${sets.join(', ')} WHERE id = ?`).run(...values);
  }

  addMessage(sessionId: string, role: Message['role'], content: string, toolCalls?: string, toolCallId?: string): Message {
    const id = uuid();
    const db = getDb();
    db.prepare(
      `INSERT INTO messages (id, session_id, role, content, tool_calls, tool_call_id) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, sessionId, role, content, toolCalls ?? null, toolCallId ?? null);
    db.prepare("UPDATE sessions SET updated_at = datetime('now') WHERE id = ?").run(sessionId);
    return { id, sessionId, role, content, toolCalls, toolCallId, createdAt: new Date().toISOString() };
  }

  getMessages(sessionId: string, limit = 100): Message[] {
    const db = getDb();
    const rows = db
      .prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC LIMIT ?')
      .all(sessionId, limit) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: row.id as string,
      sessionId: row.session_id as string,
      role: row.role as Message['role'],
      content: row.content as string,
      toolCalls: row.tool_calls as string | undefined,
      toolCallId: row.tool_call_id as string | undefined,
      createdAt: row.created_at as string,
    }));
  }

  deleteSession(id: string) {
    const db = getDb();
    db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
  }
}

export const sessionStore = new SessionStore();
