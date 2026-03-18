import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import type { MemoryEntry, UserPreference } from '@/lib/types';

export class MemoryStore {
  saveMemory(userId: string, category: string, content: string, metadata?: Record<string, unknown>): MemoryEntry {
    const id = uuid();
    const db = getDb();
    db.prepare(
      `INSERT INTO memory_entries (id, user_id, category, content, metadata) VALUES (?, ?, ?, ?, ?)`
    ).run(id, userId, category, content, metadata ? JSON.stringify(metadata) : null);
    return { id, userId, category, content, metadata, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  }

  getMemories(userId: string, category?: string, limit = 20): MemoryEntry[] {
    const db = getDb();
    let query = 'SELECT * FROM memory_entries WHERE user_id = ?';
    const params: unknown[] = [userId];
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    query += ' ORDER BY updated_at DESC LIMIT ?';
    params.push(limit);
    const rows = db.prepare(query).all(...params) as Record<string, unknown>[];
    return rows.map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      category: row.category as string,
      content: row.content as string,
      metadata: row.metadata ? JSON.parse(row.metadata as string) : undefined,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    }));
  }

  setPreference(userId: string, key: string, value: string) {
    const db = getDb();
    db.prepare(
      `INSERT INTO user_preferences (id, user_id, key, value) VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value`
    ).run(uuid(), userId, key, value);
  }

  getPreference(userId: string, key: string): string | null {
    const db = getDb();
    const row = db.prepare('SELECT value FROM user_preferences WHERE user_id = ? AND key = ?').get(userId, key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  getAllPreferences(userId: string): UserPreference[] {
    const db = getDb();
    const rows = db.prepare('SELECT key, value FROM user_preferences WHERE user_id = ?').all(userId) as UserPreference[];
    return rows;
  }

  deleteMemory(id: string) {
    const db = getDb();
    db.prepare('DELETE FROM memory_entries WHERE id = ?').run(id);
  }
}

export const memoryStore = new MemoryStore();
