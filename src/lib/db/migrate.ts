import { getDb } from './connection';
import { logger } from '@/lib/logging';

const MIGRATIONS = [
  {
    version: 1,
    description: 'Initial schema',
    sql: `
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

      CREATE TABLE IF NOT EXISTS file_records (
        id TEXT PRIMARY KEY,
        session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
        user_id TEXT REFERENCES users(id),
        filename TEXT NOT NULL,
        file_type TEXT NOT NULL CHECK(file_type IN ('docx', 'xlsx', 'pptx', 'accdb', 'csv', 'txt')),
        file_size INTEGER,
        parsed_context TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS tool_calls (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        message_id TEXT REFERENCES messages(id),
        tool_name TEXT NOT NULL,
        arguments TEXT,
        result TEXT,
        status TEXT CHECK(status IN ('pending', 'success', 'error')) DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS action_previews (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
        action_type TEXT NOT NULL,
        description TEXT NOT NULL,
        preview_data TEXT,
        status TEXT CHECK(status IN ('pending', 'approved', 'rejected', 'applied')) DEFAULT 'pending',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        session_id TEXT,
        action TEXT NOT NULL,
        details TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS template_library (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        app_type TEXT NOT NULL CHECK(app_type IN ('word', 'excel', 'powerpoint', 'access', 'general')),
        category TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        language TEXT DEFAULT 'en',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS indexed_knowledge (
        id TEXT PRIMARY KEY,
        source TEXT NOT NULL,
        category TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        embedding TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id);
      CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
      CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_entries(user_id);
      CREATE INDEX IF NOT EXISTS idx_file_records_session ON file_records(session_id);
      CREATE INDEX IF NOT EXISTS idx_tool_calls_session ON tool_calls(session_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_templates_app ON template_library(app_type);

      CREATE TABLE IF NOT EXISTS schema_version (
        version INTEGER PRIMARY KEY
      );
    `,
  },
];

export function migrate() {
  const db = getDb();

  db.exec(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER PRIMARY KEY)`);
  const row = db.prepare('SELECT MAX(version) as v FROM schema_version').get() as { v: number | null } | undefined;
  const currentVersion = row?.v ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > currentVersion) {
      logger.info(`Running migration v${migration.version}: ${migration.description}`);
      db.exec(migration.sql);
      db.prepare('INSERT OR REPLACE INTO schema_version (version) VALUES (?)').run(migration.version);
    }
  }

  logger.info('Database migrations complete');
}
