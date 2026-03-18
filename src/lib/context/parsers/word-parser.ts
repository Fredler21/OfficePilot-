import mammoth from 'mammoth';
import { v4 as uuid } from 'uuid';
import type { ParsedDocument, DocumentSection, WordContext } from '../types';
import { FileParseError } from '@/lib/errors';
import { logger } from '@/lib/logging';

export async function parseWordDocument(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const htmlResult = await mammoth.convertToHtml({ buffer });

    const text = result.value;
    const html = htmlResult.value;

    const context = extractWordContext(text, html);
    const sections = buildWordSections(context);

    return {
      type: 'word',
      filename,
      sections,
      metadata: {
        wordCount: text.split(/\s+/).filter(Boolean).length,
        paragraphCount: context.paragraphs.length,
        headingCount: context.headings.length,
        hasComments: context.comments.length > 0,
      },
      raw: text,
    };
  } catch (err) {
    logger.error('Failed to parse Word document', { filename, error: String(err) });
    throw new FileParseError(`Failed to parse Word file: ${filename}`, { filename });
  }
}

function extractWordContext(text: string, html: string): WordContext {
  const headings: WordContext['headings'] = [];
  const headingRegex = /<h(\d)[^>]*>(.*?)<\/h\d>/gi;
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({ level: parseInt(match[1]), text: stripHtml(match[2]) });
  }

  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  const tables: WordContext['tables'] = [];
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi;
  while ((match = tableRegex.exec(html)) !== null) {
    const rows: string[][] = [];
    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let rowMatch;
    while ((rowMatch = rowRegex.exec(match[1])) !== null) {
      const cells: string[] = [];
      const cellRegex = /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;
      let cellMatch;
      while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
        cells.push(stripHtml(cellMatch[1]).trim());
      }
      rows.push(cells);
    }
    tables.push({ rows });
  }

  return { headings, paragraphs, tables, comments: [], styles: [] };
}

function buildWordSections(context: WordContext): DocumentSection[] {
  const sections: DocumentSection[] = [];

  for (const heading of context.headings) {
    sections.push({
      id: uuid(),
      type: `heading-${heading.level}`,
      title: heading.text,
      content: heading.text,
    });
  }

  for (let i = 0; i < context.paragraphs.length; i++) {
    sections.push({
      id: uuid(),
      type: 'paragraph',
      content: context.paragraphs[i],
    });
  }

  for (let i = 0; i < context.tables.length; i++) {
    sections.push({
      id: uuid(),
      type: 'table',
      title: `Table ${i + 1}`,
      content: context.tables[i].rows.map((r: string[]) => r.join(' | ')).join('\n'),
    });
  }

  return sections;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function wordContextToSummary(context: WordContext): string {
  const parts: string[] = [];
  if (context.headings.length > 0) {
    parts.push(`Headings: ${context.headings.map((h: { level: number; text: string }) => `${'#'.repeat(h.level)} ${h.text}`).join(', ')}`);
  }
  parts.push(`Paragraphs: ${context.paragraphs.length}`);
  if (context.tables.length > 0) {
    parts.push(`Tables: ${context.tables.length}`);
  }
  return parts.join('\n');
}
