export { parseWordDocument, wordContextToSummary } from './parsers/word-parser';
export { parseExcelDocument, excelContextToSummary } from './parsers/excel-parser';
export { parsePowerPointDocument, pptContextToSummary } from './parsers/pptx-parser';
export { parseAccessSchema, accessContextToSummary } from './parsers/access-parser';
export type { AccessSchemaInput } from './parsers/access-parser';
export * from './types';

import { parseWordDocument } from './parsers/word-parser';
import { parseExcelDocument } from './parsers/excel-parser';
import { parsePowerPointDocument } from './parsers/pptx-parser';
import type { ParsedDocument } from './types';
import { FileParseError } from '@/lib/errors';

export async function parseFile(buffer: Buffer, filename: string): Promise<ParsedDocument> {
  const ext = filename.toLowerCase().split('.').pop();

  switch (ext) {
    case 'docx':
      return parseWordDocument(buffer, filename);
    case 'xlsx':
    case 'xls':
    case 'csv':
      return parseExcelDocument(buffer, filename);
    case 'pptx':
      return parsePowerPointDocument(buffer, filename);
    default:
      throw new FileParseError(`Unsupported file type: .${ext}`, { filename, ext });
  }
}

export function getAppModeFromFileType(fileType: string): 'word' | 'excel' | 'powerpoint' | 'access' {
  switch (fileType) {
    case 'docx': return 'word';
    case 'xlsx': case 'xls': case 'csv': return 'excel';
    case 'pptx': return 'powerpoint';
    case 'accdb': case 'mdb': return 'access';
    default: return 'word';
  }
}
