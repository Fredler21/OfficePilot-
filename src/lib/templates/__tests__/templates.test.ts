import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';

const SCHEMA_SQL = `
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
`;

describe('Template Library (direct DB)', () => {
  let db: Database.Database;

  const templates = [
    { name: 'Professional Resume', appType: 'word', category: 'resume', description: 'Resume template', content: '# Resume', language: 'en' },
    { name: 'Business Report', appType: 'word', category: 'report', description: 'Report template', content: '# Report', language: 'en' },
    { name: 'Monthly Budget', appType: 'excel', category: 'budget', description: 'Budget template', content: 'Budget setup', language: 'en' },
    { name: 'Sales Dashboard', appType: 'excel', category: 'business', description: 'Dashboard template', content: 'Dashboard', language: 'en' },
    { name: 'Business Presentation', appType: 'powerpoint', category: 'business', description: 'PPT template', content: 'Slides', language: 'en' },
    { name: 'Customer Database', appType: 'access', category: 'business', description: 'CRM template', content: 'Tables', language: 'en' },
  ];

  beforeAll(() => {
    db = new Database(':memory:');
    db.exec(SCHEMA_SQL);
    const stmt = db.prepare(
      'INSERT INTO template_library (id, name, app_type, category, description, content, language) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const t of templates) {
      stmt.run(uuid(), t.name, t.appType, t.category, t.description, t.content, t.language);
    }
  });

  afterAll(() => {
    db.close();
  });

  it('seeds all templates', () => {
    const count = db.prepare('SELECT COUNT(*) as count FROM template_library').get() as { count: number };
    expect(count.count).toBe(templates.length);
  });

  it('filters templates by app_type', () => {
    const wordTemplates = db.prepare('SELECT * FROM template_library WHERE app_type = ?').all('word') as Record<string, unknown>[];
    expect(wordTemplates).toHaveLength(2);
    expect(wordTemplates.every((t) => t.app_type === 'word')).toBe(true);
  });

  it('filters templates by category', () => {
    const businessTemplates = db.prepare('SELECT * FROM template_library WHERE category = ?').all('business') as Record<string, unknown>[];
    expect(businessTemplates.length).toBeGreaterThanOrEqual(2);
  });

  it('filters by app_type and category', () => {
    const rows = db.prepare('SELECT * FROM template_library WHERE app_type = ? AND category = ?').all('powerpoint', 'business') as Record<string, unknown>[];
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe('Business Presentation');
  });

  it('retrieves a single template by id', () => {
    const all = db.prepare('SELECT * FROM template_library').all() as Record<string, unknown>[];
    const row = db.prepare('SELECT * FROM template_library WHERE id = ?').get(all[0].id) as Record<string, unknown>;
    expect(row).toBeTruthy();
    expect(row.id).toBe(all[0].id);
  });

  it('returns undefined for non-existent template', () => {
    const row = db.prepare('SELECT * FROM template_library WHERE id = ?').get('nonexistent');
    expect(row).toBeUndefined();
  });

  it('covers all four Office apps', () => {
    const types = db.prepare('SELECT DISTINCT app_type FROM template_library').all() as { app_type: string }[];
    const typeSet = new Set(types.map((t) => t.app_type));
    expect(typeSet.has('word')).toBe(true);
    expect(typeSet.has('excel')).toBe(true);
    expect(typeSet.has('powerpoint')).toBe(true);
    expect(typeSet.has('access')).toBe(true);
  });

  it('enforces app_type CHECK constraint', () => {
    expect(() => {
      db.prepare('INSERT INTO template_library (id, name, app_type, category, content) VALUES (?, ?, ?, ?, ?)').run(uuid(), 'Bad', 'invalid', 'test', 'content');
    }).toThrow();
  });
});
