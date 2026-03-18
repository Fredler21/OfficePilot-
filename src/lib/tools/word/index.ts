import type { ToolHandler, ToolContext, ToolResult } from '../registry';

export const analyzeDocumentFormat: ToolHandler = {
  name: 'analyze_document_format',
  description: 'Analyze a Word document for formatting compliance — checks heading structure, margins, spacing, font consistency, and style guide adherence (APA, MLA, Chicago, etc.).',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian', 'general'],
        description: 'The formatting standard to check against',
      },
      focus: {
        type: 'string',
        enum: ['headings', 'margins', 'fonts', 'spacing', 'citations', 'full'],
        description: 'Which formatting aspect to analyze',
      },
    },
    required: ['format'],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const format = args.format as string;
    const focus = (args.focus as string) || 'full';
    const fileContext = context.fileContext || 'No document loaded.';

    return {
      success: true,
      data: { format, focus, context: fileContext },
      message: `Document formatting analysis (${format.toUpperCase()}, focus: ${focus}):\n${fileContext}`,
    };
  },
};

export const formatCitation: ToolHandler = {
  name: 'format_citation',
  description: 'Format a citation or bibliography entry in APA, MLA, Chicago, Harvard, IEEE, or Turabian style. Checks for correct ordering, punctuation, italics, and indentation.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      source: { type: 'string', description: 'Source information (title, author, year, publisher, URL, etc.)' },
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian'],
        description: 'Citation format style',
      },
      type: {
        type: 'string',
        enum: ['book', 'article', 'website', 'journal', 'conference', 'thesis', 'report'],
        description: 'Type of source',
      },
      citationType: {
        type: 'string',
        enum: ['in-text', 'reference-list', 'footnote', 'endnote'],
        description: 'Whether this is an in-text citation or full reference entry',
      },
    },
    required: ['source', 'format'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Citation formatted in ${(args.format as string).toUpperCase()} style (${args.citationType || 'reference-list'}).`,
    };
  },
};

export const checkDocumentStructure: ToolHandler = {
  name: 'check_document_structure',
  description: 'Validate document structure: heading hierarchy (H1→H2→H3), section ordering (title page, abstract, body, references), page breaks, and required sections for the chosen format.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      documentType: {
        type: 'string',
        enum: ['essay', 'research-paper', 'report', 'thesis', 'memo', 'proposal', 'resume', 'letter'],
        description: 'Type of document to validate structure against',
      },
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian', 'general'],
        description: 'Formatting standard to check structure against',
      },
    },
    required: ['documentType'],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const fileContext = context.fileContext || 'No document loaded.';
    return {
      success: true,
      data: { ...args, context: fileContext },
      message: `Document structure check for ${args.documentType} (${args.format || 'general'} format).`,
    };
  },
};

export const suggestFormattingFixes: ToolHandler = {
  name: 'suggest_formatting_fixes',
  description: 'Suggest specific formatting corrections for a Word document — fix spacing, font sizes, heading levels, margin issues, indentation, and page layout to match the target style guide.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian', 'general'],
        description: 'Target formatting standard',
      },
      issues: {
        type: 'string',
        description: 'Specific formatting issues to address (optional — analyzes all if omitted)',
      },
    },
    required: ['format'],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const fileContext = context.fileContext || 'No document loaded.';
    return {
      success: true,
      requiresPreview: true,
      data: { ...args, context: fileContext },
      message: `Formatting fixes suggested for ${(args.format as string).toUpperCase()} compliance.`,
      previewData: { action: 'format_fixes', format: args.format },
    };
  },
};

export const generateDocumentTemplate: ToolHandler = {
  name: 'generate_document_template',
  description: 'Generate a properly formatted document template/skeleton with correct headings, spacing, margins, and section order for the chosen format (APA, MLA, etc.) and document type.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      documentType: {
        type: 'string',
        enum: ['essay', 'research-paper', 'report', 'thesis', 'memo', 'proposal', 'resume', 'letter', 'annotated-bibliography'],
        description: 'Type of document template to generate',
      },
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian'],
        description: 'Formatting standard for the template',
      },
    },
    required: ['documentType', 'format'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Template generated: ${args.documentType} in ${(args.format as string).toUpperCase()} format.`,
    };
  },
};

export const formatTableOfContents: ToolHandler = {
  name: 'format_table_of_contents',
  description: 'Generate or validate a Table of Contents, List of Figures, or List of Tables based on the document headings and the chosen style guide formatting rules.',
  appModes: ['word', 'general'],
  parameters: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['toc', 'list-of-figures', 'list-of-tables'],
        description: 'Type of table/list to generate or validate',
      },
      format: {
        type: 'string',
        enum: ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'turabian'],
        description: 'Formatting standard',
      },
    },
    required: ['type'],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const fileContext = context.fileContext || 'No document loaded.';
    return {
      success: true,
      data: { ...args, context: fileContext },
      message: `${args.type === 'toc' ? 'Table of Contents' : args.type === 'list-of-figures' ? 'List of Figures' : 'List of Tables'} generated/validated.`,
    };
  },
};

export const wordTools: ToolHandler[] = [
  analyzeDocumentFormat,
  formatCitation,
  checkDocumentStructure,
  suggestFormattingFixes,
  generateDocumentTemplate,
  formatTableOfContents,
];
