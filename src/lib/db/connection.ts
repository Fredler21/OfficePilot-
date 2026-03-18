import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { getConfig } from '@/lib/config';
import { logger } from '@/lib/logging';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const config = getConfig();
  const dbPath = path.resolve(config.DATABASE_PATH);
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  _db = new Database(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  logger.info('Database connected', { path: dbPath });
  return _db;
}

export function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}
