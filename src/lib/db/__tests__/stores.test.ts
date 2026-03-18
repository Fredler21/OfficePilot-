import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

// Direct DB tests without going through the singleton to avoid side effects.
// We replicate the schema setup here for isolation.

const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    preferred_language TEXT DEFAULT 'en',
    preferred_tone TEXT DEFAULT 'professional',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    app_mode TEXT CHECK(app_mode IN ('word', 'excel', 'powerpoint', 'access', 'general')) DEFAULT 'general',
    title TEXT,
    language TEXT DEFAULT 'en',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('system', 'user', 'assistant', 'tool')),
    content TEXT NOT NULL,
    tool_calls TEXT,
    tool_call_id TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS user_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, key)
  );
  CREATE TABLE IF NOT EXISTS memory_entries (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );
`;

describe('SessionStore (direct DB)', () => {
  let db: Database.Database;
  const userId = 'test-user';

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA_SQL);
    db.prepare("INSERT INTO users (id, display_name) VALUES (?, ?)").run(userId, 'Test User');
  });

  afterAll(() => {
    db.close();
  });

  it('creates and retrieves a session', () => {
    const id = uuid();
    db.prepare('INSERT INTO sessions (id, user_id, app_mode, language) VALUES (?, ?, ?, ?)').run(id, userId, 'excel', 'en');
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown>;
    expect(row.id).toBe(id);
    expect(row.user_id).toBe(userId);
    expect(row.app_mode).toBe('excel');
  });

  it('returns undefined for non-existent session', () => {
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get('nonexistent');
    expect(row).toBeUndefined();
  });

  it('lists sessions for a user', () => {
    const id1 = uuid();
    const id2 = uuid();
    db.prepare('INSERT INTO sessions (id, user_id, app_mode) VALUES (?, ?, ?)').run(id1, userId, 'word');
    db.prepare('INSERT INTO sessions (id, user_id, app_mode) VALUES (?, ?, ?)').run(id2, userId, 'powerpoint');
    const rows = db.prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC').all(userId);
    expect(rows.length).toBeGreaterThanOrEqual(2);
  });

  it('updates session fields', () => {
    const id = uuid();
    db.prepare('INSERT INTO sessions (id, user_id, app_mode) VALUES (?, ?, ?)').run(id, userId, 'general');
    db.prepare("UPDATE sessions SET app_mode = ?, title = ?, updated_at = datetime('now') WHERE id = ?").run('access', 'My DB', id);
    const row = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as Record<string, unknown>;
    expect(row.app_mode).toBe('access');
    expect(row.title).toBe('My DB');
  });

  it('adds and retrieves messages', () => {
    const sessionId = uuid();
    db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(sessionId, userId);

    const m1 = uuid();
    const m2 = uuid();
    db.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)').run(m1, sessionId, 'user', 'Hello');
    db.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)').run(m2, sessionId, 'assistant', 'Hi there!');

    const messages = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC').all(sessionId) as Record<string, unknown>[];
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].content).toBe('Hi there!');
  });

  it('cascade deletes messages when session is deleted', () => {
    const sessionId = uuid();
    db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(sessionId, userId);
    db.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)').run(uuid(), sessionId, 'user', 'test');
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    const messages = db.prepare('SELECT * FROM messages WHERE session_id = ?').all(sessionId);
    expect(messages).toHaveLength(0);
  });

  it('enforces app_mode CHECK constraint', () => {
    expect(() => {
      db.prepare('INSERT INTO sessions (id, user_id, app_mode) VALUES (?, ?, ?)').run(uuid(), userId, 'invalid_mode');
    }).toThrow();
  });

  it('enforces role CHECK constraint on messages', () => {
    const sessionId = uuid();
    db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(sessionId, userId);
    expect(() => {
      db.prepare('INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)').run(uuid(), sessionId, 'invalid_role', 'test');
    }).toThrow();
  });
});

describe('MemoryStore (direct DB)', () => {
  let db: Database.Database;
  const userId = 'mem-user';

  beforeAll(() => {
    db = new Database(':memory:');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(SCHEMA_SQL);
    db.prepare("INSERT INTO users (id, display_name) VALUES (?, ?)").run(userId, 'Mem User');
  });

  afterAll(() => {
    db.close();
  });

  it('saves and retrieves memory entries', () => {
    const id = uuid();
    db.prepare('INSERT INTO memory_entries (id, user_id, category, content) VALUES (?, ?, ?, ?)').run(id, userId, 'formula', 'User prefers XLOOKUP');
    const rows = db.prepare('SELECT * FROM memory_entries WHERE user_id = ?').all(userId) as Record<string, unknown>[];
    expect(rows.length).toBe(1);
    expect(rows[0].content).toBe('User prefers XLOOKUP');
  });

  it('filters by category', () => {
    db.prepare('INSERT INTO memory_entries (id, user_id, category, content) VALUES (?, ?, ?, ?)').run(uuid(), userId, 'style', 'Dark theme');
    db.prepare('INSERT INTO memory_entries (id, user_id, category, content) VALUES (?, ?, ?, ?)').run(uuid(), userId, 'formula', 'Metric units');
    const formulaEntries = db.prepare('SELECT * FROM memory_entries WHERE user_id = ? AND category = ?').all(userId, 'formula') as Record<string, unknown>[];
    expect(formulaEntries.every((r) => r.category === 'formula')).toBe(true);
  });

  it('stores and retrieves JSON metadata', () => {
    const id = uuid();
    const meta = JSON.stringify({ project: 'sales' });
    db.prepare('INSERT INTO memory_entries (id, user_id, category, content, metadata) VALUES (?, ?, ?, ?, ?)').run(id, userId, 'context', 'Sales project', meta);
    const row = db.prepare('SELECT * FROM memory_entries WHERE id = ?').get(id) as Record<string, unknown>;
    expect(JSON.parse(row.metadata as string)).toEqual({ project: 'sales' });
  });

  it('sets and retrieves user preferences', () => {
    db.prepare('INSERT INTO user_preferences (id, user_id, key, value) VALUES (?, ?, ?, ?)').run(uuid(), userId, 'language', 'fr');
    const row = db.prepare('SELECT value FROM user_preferences WHERE user_id = ? AND key = ?').get(userId, 'language') as { value: string };
    expect(row.value).toBe('fr');
  });

  it('upserts preferences on conflict', () => {
    db.prepare('INSERT INTO user_preferences (id, user_id, key, value) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value')
      .run(uuid(), userId, 'tone', 'casual');
    db.prepare('INSERT INTO user_preferences (id, user_id, key, value) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value')
      .run(uuid(), userId, 'tone', 'professional');
    const row = db.prepare('SELECT value FROM user_preferences WHERE user_id = ? AND key = ?').get(userId, 'tone') as { value: string };
    expect(row.value).toBe('professional');
  });

  it('deletes memory entries', () => {
    const id = uuid();
    db.prepare('INSERT INTO memory_entries (id, user_id, category, content) VALUES (?, ?, ?, ?)').run(id, userId, 'temp', 'To delete');
    db.prepare('DELETE FROM memory_entries WHERE id = ?').run(id);
    const row = db.prepare('SELECT * FROM memory_entries WHERE id = ?').get(id);
    expect(row).toBeUndefined();
  });
});
