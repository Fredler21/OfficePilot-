import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { logger } from '@/lib/logging';

export interface KnowledgeChunk {
  id: string;
  source: string;
  category: string;
  title: string;
  content: string;
  chunkIndex: number;
  totalChunks: number;
}

const CHUNK_SIZE = 2000; // characters per chunk
const CHUNK_OVERLAP = 200; // overlap between chunks for context continuity

/**
 * Parse a PDF file and extract its text content.
 */
export async function parsePdf(buffer: Buffer, filename: string): Promise<{ text: string; pages: number; info: Record<string, unknown> }> {
  const { PDFParse } = await import('pdf-parse');
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return {
    text: result.text,
    pages: result.total,
    info: {
      title: filename,
    },
  };
}

/**
 * Split text into overlapping chunks for storage.
 */
export function chunkText(text: string, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP): string[] {
  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start + overlap >= text.length) break;
  }

  return chunks.filter((c) => c.length > 50);
}

/**
 * Ingest a PDF into the knowledge base.
 * Parses the PDF, chunks the text, and stores each chunk in indexed_knowledge.
 */
export async function ingestPdf(
  buffer: Buffer,
  filename: string,
  category: 'word' | 'excel' | 'powerpoint' | 'access' | 'general'
): Promise<{ chunksCreated: number; pages: number; title: string }> {
  const { text, pages, info } = await parsePdf(buffer, filename);
  const title = (info.title as string) || filename.replace(/\.pdf$/i, '');

  if (!text || text.trim().length < 100) {
    throw new Error(`PDF "${filename}" has insufficient text content for knowledge ingestion.`);
  }

  const chunks = chunkText(text);
  const db = getDb();

  // Remove any existing knowledge from this source to allow re-ingestion
  db.prepare('DELETE FROM indexed_knowledge WHERE source = ?').run(filename);

  const stmt = db.prepare(
    'INSERT INTO indexed_knowledge (id, source, category, title, content) VALUES (?, ?, ?, ?, ?)'
  );

  const insertMany = db.transaction(() => {
    for (let i = 0; i < chunks.length; i++) {
      const chunkTitle = chunks.length > 1 ? `${title} (Part ${i + 1}/${chunks.length})` : title;
      stmt.run(uuid(), filename, category, chunkTitle, chunks[i]);
    }
  });

  insertMany();

  logger.info('PDF ingested into knowledge base', {
    filename,
    category,
    pages,
    chunks: chunks.length,
  });

  return { chunksCreated: chunks.length, pages, title };
}

/**
 * Search the knowledge base for relevant chunks.
 */
export function searchKnowledge(query: string, category?: string, limit = 10): KnowledgeChunk[] {
  const db = getDb();
  const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);

  if (words.length === 0) return [];

  // Search for chunks containing any of the query words
  const conditions = words.map(() => 'LOWER(content) LIKE ?');
  let sql = `SELECT id, source, category, title, content FROM indexed_knowledge WHERE (${conditions.join(' OR ')})`;
  const params: unknown[] = words.map((w) => `%${w}%`);

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(limit);

  return db.prepare(sql).all(...params) as KnowledgeChunk[];
}

/**
 * Get all knowledge sources (distinct PDFs) in the database.
 */
export function getKnowledgeSources(): { source: string; category: string; chunkCount: number }[] {
  const db = getDb();
  return db.prepare(
    'SELECT source, category, COUNT(*) as chunkCount FROM indexed_knowledge GROUP BY source, category ORDER BY source'
  ).all() as { source: string; category: string; chunkCount: number }[];
}

/**
 * Remove all knowledge from a specific source.
 */
export function deleteKnowledgeSource(source: string): number {
  const db = getDb();
  const result = db.prepare('DELETE FROM indexed_knowledge WHERE source = ?').run(source);
  return result.changes;
}

/**
 * Build a context string from relevant knowledge chunks for the agent.
 */
export function buildKnowledgeContext(query: string, category?: string): string {
  try {
    const chunks = searchKnowledge(query, category, 5);
    if (chunks.length === 0) return '';

    const parts = chunks.map((c) => `[Source: ${c.source}]\n${c.content}`);
    return parts.join('\n\n---\n\n');
  } catch {
    // DB may not be available (e.g., in tests)
    return '';
  }
}
