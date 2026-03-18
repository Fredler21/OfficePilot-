import type { ToolHandler, ToolResult } from '../registry';

export const designAccessSchema: ToolHandler = {
  name: 'design_access_schema',
  description: 'Design database tables, fields, and relationships from a real-world scenario or business description.',
  appModes: ['access', 'general'],
  parameters: {
    type: 'object',
    properties: {
      scenario: { type: 'string', description: 'Description of the business scenario or data needs' },
      existingTables: {
        type: 'array',
        items: { type: 'string' },
        description: 'Names of existing tables to consider',
      },
      normalize: { type: 'boolean', description: 'Whether to suggest a normalized design' },
    },
    required: ['scenario'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Database schema designed for: "${args.scenario}"`,
    };
  },
};

export const generateAccessQueryHelp: ToolHandler = {
  name: 'generate_access_query_help',
  description: 'Help build or debug an Access query (SELECT, filter, sort, totals, joins).',
  appModes: ['access', 'general'],
  parameters: {
    type: 'object',
    properties: {
      intent: { type: 'string', description: 'What the query should do in plain English' },
      tables: {
        type: 'array',
        items: { type: 'string' },
        description: 'Table names involved',
      },
      existingQuery: { type: 'string', description: 'Existing query to debug or modify' },
    },
    required: ['intent'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Query help for: "${args.intent}"`,
    };
  },
};

export const explainRelationshipMap: ToolHandler = {
  name: 'explain_relationship_map',
  description: 'Explain database relationships between tables in beginner-friendly language, including one-to-many, many-to-many, and foreign keys.',
  appModes: ['access', 'general'],
  parameters: {
    type: 'object',
    properties: {
      tables: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            fields: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        description: 'Tables and their fields',
      },
      relationships: {
        type: 'array',
        items: { type: 'string' },
        description: 'Known relationships in natural language',
      },
    },
    required: ['tables'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    const tables = args.tables as { name: string }[];
    return {
      success: true,
      data: args,
      message: `Relationship explanation generated for ${tables.length} table(s).`,
    };
  },
};

export const suggestFormReport: ToolHandler = {
  name: 'suggest_form_report',
  description: 'Suggest form or report designs for an Access database based on tables and user needs.',
  appModes: ['access', 'general'],
  parameters: {
    type: 'object',
    properties: {
      purpose: { type: 'string', description: 'What the form or report should accomplish' },
      tables: {
        type: 'array',
        items: { type: 'string' },
        description: 'Relevant table names',
      },
      type: {
        type: 'string',
        enum: ['form', 'report', 'both'],
        description: 'Whether to suggest a form, report, or both',
      },
    },
    required: ['purpose'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `${args.type || 'form/report'} suggestion for: "${args.purpose}"`,
    };
  },
};

export const accessTools: ToolHandler[] = [
  designAccessSchema,
  generateAccessQueryHelp,
  explainRelationshipMap,
  suggestFormReport,
];
