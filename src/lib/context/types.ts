export interface ParsedDocument {
  type: 'word' | 'excel' | 'powerpoint' | 'access';
  filename: string;
  sections: DocumentSection[];
  metadata: Record<string, unknown>;
  raw?: string;
}

export interface DocumentSection {
  id: string;
  type: string;
  title?: string;
  content: string;
  children?: DocumentSection[];
  metadata?: Record<string, unknown>;
}

export interface WordContext {
  headings: { level: number; text: string }[];
  paragraphs: string[];
  tables: { rows: string[][] }[];
  comments: string[];
  styles: string[];
}

export interface ExcelContext {
  sheets: ExcelSheet[];
  namedRanges: string[];
}

export interface ExcelSheet {
  name: string;
  headers: string[];
  rows: (string | number | null)[][];
  formulas: { cell: string; formula: string }[];
  errors: { cell: string; error: string }[];
  charts: string[];
}

export interface PowerPointContext {
  slides: SlideContext[];
  slideCount: number;
}

export interface SlideContext {
  index: number;
  title: string | null;
  bullets: string[];
  notes: string | null;
  placeholders: string[];
}

export interface AccessContext {
  tables: AccessTable[];
  relationships: AccessRelationship[];
  queries: string[];
  forms: string[];
  reports: string[];
}

export interface AccessTable {
  name: string;
  fields: { name: string; type: string; isPrimary: boolean }[];
}

export interface AccessRelationship {
  from: { table: string; field: string };
  to: { table: string; field: string };
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}
