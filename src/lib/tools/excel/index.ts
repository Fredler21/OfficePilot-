import type { ToolHandler, ToolContext, ToolResult } from '../registry';

export const buildExcelFormula: ToolHandler = {
  name: 'build_excel_formula',
  description: 'Generate an Excel formula from a plain English description of what the user wants to calculate.',
  appModes: ['excel', 'general'],
  parameters: {
    type: 'object',
    properties: {
      intent: { type: 'string', description: 'Plain English description of the desired calculation' },
      context: { type: 'string', description: 'Relevant cell references, headers, or sheet context' },
      cellTarget: { type: 'string', description: 'The cell where the formula should be placed (e.g., B10)' },
    },
    required: ['intent'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Formula generation request: "${args.intent}"`,
    };
  },
};

export const explainExcelFormula: ToolHandler = {
  name: 'explain_excel_formula',
  description: 'Explain what an Excel formula does in plain English, step by step.',
  appModes: ['excel', 'general'],
  parameters: {
    type: 'object',
    properties: {
      formula: { type: 'string', description: 'The Excel formula to explain' },
      detail: {
        type: 'string',
        enum: ['brief', 'detailed', 'beginner'],
        description: 'Level of detail for the explanation',
      },
    },
    required: ['formula'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Explaining formula: ${args.formula}`,
    };
  },
};

export const analyzeSpreadsheetErrors: ToolHandler = {
  name: 'analyze_spreadsheet_errors',
  description: 'Diagnose and explain errors in an Excel spreadsheet (e.g., #VALUE!, #REF!, #N/A, circular references).',
  appModes: ['excel', 'general'],
  parameters: {
    type: 'object',
    properties: {
      errors: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            cell: { type: 'string' },
            formula: { type: 'string' },
            error: { type: 'string' },
          },
        },
        description: 'List of cells with errors',
      },
      sheetContext: { type: 'string', description: 'Additional context about the sheet' },
    },
    required: ['errors'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const errors = args.errors as { cell: string; error: string }[];
    return {
      success: true,
      data: args,
      message: `Analyzing ${errors.length} spreadsheet error(s).`,
    };
  },
};

export const recommendChart: ToolHandler = {
  name: 'recommend_chart',
  description: 'Recommend the best chart type for the given data and purpose.',
  appModes: ['excel', 'powerpoint', 'general'],
  parameters: {
    type: 'object',
    properties: {
      dataDescription: { type: 'string', description: 'Description of the data to visualize' },
      purpose: { type: 'string', description: 'Purpose of the chart (comparison, trend, distribution, etc.)' },
      headers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Column headers from the data',
      },
    },
    required: ['dataDescription'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Chart recommendation for: "${args.dataDescription}"`,
    };
  },
};

export const analyzeSpreadsheet: ToolHandler = {
  name: 'analyze_spreadsheet',
  description: 'Analyze the structure and data in the current Excel workbook, including sheets, headers, formulas, and data patterns.',
  appModes: ['excel', 'general'],
  parameters: {
    type: 'object',
    properties: {
      focus: {
        type: 'string',
        enum: ['structure', 'formulas', 'errors', 'data', 'full'],
        description: 'What aspect to analyze',
      },
      sheet: { type: 'string', description: 'Specific sheet name to focus on' },
    },
    required: [],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    return {
      success: true,
      data: { focus: args.focus || 'full', context: context.fileContext },
      message: `Spreadsheet analysis:\n${context.fileContext || 'No spreadsheet loaded.'}`,
    };
  },
};

export const excelTools: ToolHandler[] = [
  buildExcelFormula,
  explainExcelFormula,
  analyzeSpreadsheetErrors,
  recommendChart,
  analyzeSpreadsheet,
];
