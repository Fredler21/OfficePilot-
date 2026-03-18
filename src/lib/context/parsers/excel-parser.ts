import * as XLSX from 'xlsx';
import { v4 as uuid } from 'uuid';
import type { ParsedDocument, DocumentSection, ExcelContext, ExcelSheet } from '../types';
import { FileParseError } from '@/lib/errors';
import { logger } from '@/lib/logging';

export function parseExcelDocument(buffer: Buffer, filename: string): ParsedDocument {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellStyles: true });
    const context = extractExcelContext(workbook);
    const sections = buildExcelSections(context);

    return {
      type: 'excel',
      filename,
      sections,
      metadata: {
        sheetCount: context.sheets.length,
        sheetNames: context.sheets.map((s: ExcelSheet) => s.name),
        totalFormulas: context.sheets.reduce((sum: number, s: ExcelSheet) => sum + s.formulas.length, 0),
        totalErrors: context.sheets.reduce((sum: number, s: ExcelSheet) => sum + s.errors.length, 0),
      },
    };
  } catch (err) {
    logger.error('Failed to parse Excel document', { filename, error: String(err) });
    throw new FileParseError(`Failed to parse Excel file: ${filename}`, { filename });
  }
}

function extractExcelContext(workbook: XLSX.WorkBook): ExcelContext {
  const sheets: ExcelSheet[] = [];

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    if (!ws) continue;

    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    const headers: string[] = [];
    const rows: (string | number | null)[][] = [];
    const formulas: ExcelSheet['formulas'] = [];
    const errors: ExcelSheet['errors'] = [];

    // Extract headers from first row
    for (let c = range.s.c; c <= range.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r: range.s.r, c })];
      headers.push(cell?.v?.toString() ?? '');
    }

    // Extract data rows (limit to first 200 rows for context)
    const maxRows = Math.min(range.e.r, range.s.r + 200);
    for (let r = range.s.r + 1; r <= maxRows; r++) {
      const row: (string | number | null)[] = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddr = XLSX.utils.encode_cell({ r, c });
        const cell = ws[cellAddr];
        if (cell) {
          if (cell.f) {
            formulas.push({ cell: cellAddr, formula: `=${cell.f}` });
          }
          if (cell.t === 'e') {
            errors.push({ cell: cellAddr, error: cell.w ?? String(cell.v) });
          }
          row.push(cell.v ?? null);
        } else {
          row.push(null);
        }
      }
      rows.push(row);
    }

    sheets.push({ name: sheetName, headers, rows, formulas, errors, charts: [] });
  }

  return { sheets, namedRanges: Object.keys(workbook.Workbook?.Names ?? {}) };
}

function buildExcelSections(context: ExcelContext): DocumentSection[] {
  return context.sheets.map((sheet: ExcelSheet) => ({
    id: uuid(),
    type: 'sheet',
    title: sheet.name,
    content: sheetToSummary(sheet),
    metadata: {
      headers: sheet.headers,
      rowCount: sheet.rows.length,
      formulaCount: sheet.formulas.length,
      errorCount: sheet.errors.length,
    },
  }));
}

function sheetToSummary(sheet: ExcelSheet): string {
  const parts: string[] = [];
  parts.push(`Sheet: ${sheet.name}`);
  if (sheet.headers.length > 0) {
    parts.push(`Headers: ${sheet.headers.join(', ')}`);
  }
  parts.push(`Data rows: ${sheet.rows.length}`);
  if (sheet.formulas.length > 0) {
    parts.push(`Formulas (${sheet.formulas.length}):`);
    for (const f of sheet.formulas.slice(0, 10)) {
      parts.push(`  ${f.cell}: ${f.formula}`);
    }
    if (sheet.formulas.length > 10) parts.push(`  ... and ${sheet.formulas.length - 10} more`);
  }
  if (sheet.errors.length > 0) {
    parts.push(`Errors (${sheet.errors.length}):`);
    for (const e of sheet.errors) {
      parts.push(`  ${e.cell}: ${e.error}`);
    }
  }
  return parts.join('\n');
}

export function excelContextToSummary(context: ExcelContext): string {
  return context.sheets.map(sheetToSummary).join('\n\n');
}
