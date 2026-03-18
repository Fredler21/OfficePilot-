import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logging';

export interface KnowledgeEntry {
  id: string;
  source: string;
  category: string;
  title: string | null;
  content: string;
}

export class RetrievalEngine {
  index(source: string, category: string, title: string, content: string): string {
    const id = uuid();
    const db = getDb();
    db.prepare(
      `INSERT INTO indexed_knowledge (id, source, category, title, content) VALUES (?, ?, ?, ?, ?)`
    ).run(id, source, category, title, content);
    logger.info('Knowledge indexed', { id, source, category });
    return id;
  }

  search(query: string, category?: string, limit = 5): KnowledgeEntry[] {
    const db = getDb();
    let sql = `SELECT id, source, category, title, content FROM indexed_knowledge WHERE content LIKE ?`;
    const params: unknown[] = [`%${query}%`];
    if (category) {
      sql += ` AND category = ?`;
      params.push(category);
    }
    sql += ` LIMIT ?`;
    params.push(limit);

    return db.prepare(sql).all(...params) as KnowledgeEntry[];
  }

  getByCategory(category: string, limit = 20): KnowledgeEntry[] {
    const db = getDb();
    return db
      .prepare(`SELECT id, source, category, title, content FROM indexed_knowledge WHERE category = ? LIMIT ?`)
      .all(category, limit) as KnowledgeEntry[];
  }

  delete(id: string) {
    const db = getDb();
    db.prepare('DELETE FROM indexed_knowledge WHERE id = ?').run(id);
  }

  reindex() {
    logger.info('Re-indexing knowledge base');
    // In a production system, this would recompute embeddings
  }
}

export const retrievalEngine = new RetrievalEngine();
