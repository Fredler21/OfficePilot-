import type { ToolHandler, ToolContext, ToolResult } from '../registry';

export const analyzeWordDocument: ToolHandler = {
  name: 'analyze_word_document',
  description: 'Analyze the structure and content of the current Word document, including headings, paragraphs, tables, and formatting.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      focus: {
        type: 'string',
        enum: ['structure', 'content', 'formatting', 'full'],
        description: 'What aspect of the document to analyze',
      },
    },
    required: [],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const focus = (args.focus as string) || 'full';
    const fileContext = context.fileContext || 'No document loaded.';

    return {
      success: true,
      data: { focus, context: fileContext },
      message: `Document analysis (${focus}):\n${fileContext}`,
    };
  },
};

export const rewriteSelection: ToolHandler = {
  name: 'rewrite_selection',
  description: 'Rewrite selected text with a specified tone or style. Supports: formal, academic, persuasive, concise, friendly, professional.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'The text to rewrite' },
      tone: {
        type: 'string',
        enum: ['formal', 'academic', 'persuasive', 'concise', 'friendly', 'professional'],
        description: 'Target tone for the rewrite',
      },
      instructions: { type: 'string', description: 'Additional rewrite instructions' },
    },
    required: ['text', 'tone'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const text = args.text as string;
    const tone = args.tone as string;
    const instructions = args.instructions as string | undefined;

    return {
      success: true,
      requiresPreview: true,
      data: { originalText: text, tone, instructions },
      message: `Ready to rewrite text in ${tone} tone. The AI will generate the rewritten version.`,
      previewData: { action: 'rewrite', tone, originalLength: text.length },
    };
  },
};

export const formatCitation: ToolHandler = {
  name: 'format_citation',
  description: 'Format a citation in APA, MLA, Chicago, or other academic formats.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      source: { type: 'string', description: 'Source information (title, author, year, etc.)' },
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard'],
        description: 'Citation format style',
      },
      type: {
        type: 'string',
        enum: ['book', 'article', 'website', 'journal'],
        description: 'Type of source',
      },
    },
    required: ['source', 'format'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Citation formatted in ${args.format} style.`,
    };
  },
};

export const generateOutline: ToolHandler = {
  name: 'generate_outline',
  description: 'Generate a structured document outline from a topic or rough notes.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      topic: { type: 'string', description: 'Topic or rough notes to build an outline from' },
      type: {
        type: 'string',
        enum: ['essay', 'report', 'memo', 'proposal', 'letter', 'resume'],
        description: 'Document type',
      },
      depth: { type: 'number', description: 'How many heading levels deep (2-4)' },
    },
    required: ['topic'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Outline generated for: ${args.topic}`,
    };
  },
};

export const summarizeText: ToolHandler = {
  name: 'summarize_text',
  description: 'Summarize a section of text, making it shorter while preserving key points.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to summarize' },
      length: {
        type: 'string',
        enum: ['brief', 'medium', 'detailed'],
        description: 'Desired summary length',
      },
    },
    required: ['text'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Text summarized (${(args.length as string) || 'medium'} length).`,
    };
  },
};

export const wordTools: ToolHandler[] = [
  analyzeWordDocument,
  rewriteSelection,
  formatCitation,
  generateOutline,
  summarizeText,
];
