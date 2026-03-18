import { describe, it, expect } from 'vitest';
import { wordTools } from '@/lib/tools/word';
import { excelTools } from '@/lib/tools/excel';
import { powerpointTools } from '@/lib/tools/powerpoint';
import { accessTools } from '@/lib/tools/access';
import { generalTools } from '@/lib/tools/general';
import type { ToolContext } from '@/lib/tools/registry';

const ctx: ToolContext = {
  sessionId: 'test',
  userId: 'test',
  appMode: 'general',
  language: 'en',
  fileContext: 'Test file context',
};

describe('Word Tools', () => {
  it('has expected tools', () => {
    const names = wordTools.map((t) => t.name);
    expect(names).toContain('analyze_document_format');
    expect(names).toContain('format_citation');
    expect(names).toContain('check_document_structure');
    expect(names).toContain('suggest_formatting_fixes');
    expect(names).toContain('generate_document_template');
    expect(names).toContain('format_table_of_contents');
  });

  it('suggest_formatting_fixes requires preview', async () => {
    const tool = wordTools.find((t) => t.name === 'suggest_formatting_fixes')!;
    const result = await tool.execute({ documentContext: 'Test document', format: 'apa' }, ctx);
    expect(result.success).toBe(true);
    expect(result.requiresPreview).toBe(true);
  });
});

describe('Excel Tools', () => {
  it('has expected tools', () => {
    const names = excelTools.map((t) => t.name);
    expect(names).toContain('build_excel_formula');
    expect(names).toContain('explain_excel_formula');
    expect(names).toContain('analyze_spreadsheet_errors');
    expect(names).toContain('recommend_chart');
    expect(names).toContain('analyze_spreadsheet');
  });

  it('build_excel_formula executes', async () => {
    const tool = excelTools.find((t) => t.name === 'build_excel_formula')!;
    const result = await tool.execute({ intent: 'sum column A' }, ctx);
    expect(result.success).toBe(true);
  });
});

describe('PowerPoint Tools', () => {
  it('has expected tools', () => {
    const names = powerpointTools.map((t) => t.name);
    expect(names).toContain('generate_presentation_outline');
    expect(names).toContain('compress_slide_text');
    expect(names).toContain('generate_speaker_notes');
    expect(names).toContain('suggest_slide_visuals');
  });
});

describe('Access Tools', () => {
  it('has expected tools', () => {
    const names = accessTools.map((t) => t.name);
    expect(names).toContain('design_access_schema');
    expect(names).toContain('generate_access_query_help');
    expect(names).toContain('explain_relationship_map');
    expect(names).toContain('suggest_form_report');
  });
});

describe('General Tools', () => {
  it('has expected tools', () => {
    const names = generalTools.map((t) => t.name);
    expect(names).toContain('translate_output');
    expect(names).toContain('load_user_memory');
    expect(names).toContain('save_user_preference');
    expect(names).toContain('preview_file_changes');
    expect(names).toContain('load_template');
  });

  it('preview_file_changes requires preview', async () => {
    const tool = generalTools.find((t) => t.name === 'preview_file_changes')!;
    const result = await tool.execute({
      changes: [{ type: 'replace', location: 'A1', oldContent: 'x', newContent: 'y' }],
      description: 'Test change',
    }, ctx);
    expect(result.success).toBe(true);
    expect(result.requiresPreview).toBe(true);
  });
});

describe('All tools have valid structure', () => {
  const allTools = [...wordTools, ...excelTools, ...powerpointTools, ...accessTools, ...generalTools];

  for (const tool of allTools) {
    it(`${tool.name} has required fields`, () => {
      expect(tool.name).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.appModes.length).toBeGreaterThan(0);
      expect(tool.parameters).toBeDefined();
      expect(typeof tool.execute).toBe('function');
    });
  }
});
