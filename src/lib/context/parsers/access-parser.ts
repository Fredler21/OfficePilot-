import { v4 as uuid } from 'uuid';
import type { ParsedDocument, DocumentSection, AccessContext, AccessTable, AccessRelationship } from '../types';
import { logger } from '@/lib/logging';

/**
 * Access (.accdb) files can't be parsed in a Node.js environment directly.
 * This parser handles Access schema descriptions provided as JSON/text exports
 * or user-described structures. For real .accdb files, we'd need a native driver
 * or user-provided schema export.
 */

export interface AccessSchemaInput {
  tables?: {
    name: string;
    fields: { name: string; type: string; isPrimary?: boolean }[];
  }[];
  relationships?: {
    from: { table: string; field: string };
    to: { table: string; field: string };
    type?: 'one-to-one' | 'one-to-many' | 'many-to-many';
  }[];
  queries?: string[];
  forms?: string[];
  reports?: string[];
}

export function parseAccessSchema(input: AccessSchemaInput, filename: string): ParsedDocument {
  try {
    const context = buildAccessContext(input);
    const sections = buildAccessSections(context);

    return {
      type: 'access',
      filename,
      sections,
      metadata: {
        tableCount: context.tables.length,
        relationshipCount: context.relationships.length,
        queryCount: context.queries.length,
        formCount: context.forms.length,
        reportCount: context.reports.length,
      },
    };
  } catch (err) {
    logger.error('Failed to parse Access schema', { filename, error: String(err) });
    throw new Error(`Failed to parse Access schema: ${filename}`);
  }
}

function buildAccessContext(input: AccessSchemaInput): AccessContext {
  const tables: AccessTable[] = (input.tables ?? []).map((t) => ({
    name: t.name,
    fields: t.fields.map((f) => ({
      name: f.name,
      type: f.type,
      isPrimary: f.isPrimary ?? false,
    })),
  }));

  const relationships: AccessRelationship[] = (input.relationships ?? []).map((r) => ({
    from: r.from,
    to: r.to,
    type: r.type ?? 'one-to-many',
  }));

  return {
    tables,
    relationships,
    queries: input.queries ?? [],
    forms: input.forms ?? [],
    reports: input.reports ?? [],
  };
}

function buildAccessSections(context: AccessContext): DocumentSection[] {
  const sections: DocumentSection[] = [];

  for (const table of context.tables) {
    sections.push({
      id: uuid(),
      type: 'table',
      title: table.name,
      content: tableToDescription(table),
      metadata: { fieldCount: table.fields.length },
    });
  }

  if (context.relationships.length > 0) {
    sections.push({
      id: uuid(),
      type: 'relationships',
      title: 'Relationships',
      content: context.relationships
        .map((r: AccessRelationship) => `${r.from.table}.${r.from.field} → ${r.to.table}.${r.to.field} (${r.type})`)
        .join('\n'),
    });
  }

  for (const query of context.queries) {
    sections.push({
      id: uuid(),
      type: 'query',
      title: 'Query',
      content: query,
    });
  }

  return sections;
}

function tableToDescription(table: AccessTable): string {
  const lines: string[] = [`Table: ${table.name}`];
  for (const field of table.fields) {
    const pk = field.isPrimary ? ' [PK]' : '';
    lines.push(`  ${field.name} (${field.type})${pk}`);
  }
  return lines.join('\n');
}

export function accessContextToSummary(context: AccessContext): string {
  const parts: string[] = [];
  parts.push(`Tables (${context.tables.length}):`);
  for (const t of context.tables) {
    parts.push(tableToDescription(t));
  }
  if (context.relationships.length > 0) {
    parts.push(`\nRelationships:`);
    for (const r of context.relationships) {
      parts.push(`  ${r.from.table}.${r.from.field} → ${r.to.table}.${r.to.field} (${r.type})`);
    }
  }
  return parts.join('\n');
}
