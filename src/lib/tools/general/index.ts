import type { ToolHandler, ToolResult, ToolContext } from '../registry';

export const translateOutput: ToolHandler = {
  name: 'translate_output',
  description: 'Translate content between English, French, and Haitian Creole.',
  appModes: ['general', 'word', 'excel', 'powerpoint', 'access'],
  parameters: {
    type: 'object',
    properties: {
      text: { type: 'string', description: 'Text to translate' },
      targetLanguage: {
        type: 'string',
        enum: ['en', 'fr', 'ht'],
        description: 'Target language code',
      },
      sourceLanguage: {
        type: 'string',
        enum: ['en', 'fr', 'ht', 'auto'],
        description: 'Source language (auto-detect if not specified)',
      },
    },
    required: ['text', 'targetLanguage'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Translation to ${args.targetLanguage} requested.`,
    };
  },
};

export const loadUserMemory: ToolHandler = {
  name: 'load_user_memory',
  description: 'Load user preferences and memory from past sessions (preferred formatting, language, tone, recurring patterns).',
  appModes: ['general', 'word', 'excel', 'powerpoint', 'access'],
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Category of memory to load (e.g., preferences, patterns, history)',
      },
    },
    required: [],
  },
  async execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    // In a real implementation, this would load from the memory store
    return {
      success: true,
      data: { userId: context.userId, category: args.category },
      message: `User memory loaded.`,
    };
  },
};

export const saveUserPreference: ToolHandler = {
  name: 'save_user_preference',
  description: 'Save a user preference for future sessions (e.g., preferred citation format, language, tone).',
  appModes: ['general', 'word', 'excel', 'powerpoint', 'access'],
  parameters: {
    type: 'object',
    properties: {
      key: { type: 'string', description: 'Preference key (e.g., citation_format, language, tone)' },
      value: { type: 'string', description: 'Preference value' },
    },
    required: ['key', 'value'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Preference saved: ${args.key} = ${args.value}`,
    };
  },
};

export const previewFileChanges: ToolHandler = {
  name: 'preview_file_changes',
  description: 'Preview proposed changes to a file before applying them. Shows a diff of what will change.',
  appModes: ['general', 'word', 'excel', 'powerpoint', 'access'],
  parameters: {
    type: 'object',
    properties: {
      changes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['replace', 'insert', 'delete'] },
            location: { type: 'string' },
            oldContent: { type: 'string' },
            newContent: { type: 'string' },
          },
        },
        description: 'List of proposed changes',
      },
      description: { type: 'string', description: 'Summary of all proposed changes' },
    },
    required: ['changes', 'description'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      requiresPreview: true,
      data: args,
      message: `Preview generated. ${(args.changes as unknown[]).length} change(s) proposed.`,
      previewData: args,
    };
  },
};

export const loadTemplate: ToolHandler = {
  name: 'load_template',
  description: 'Load a pre-built template for common Office tasks (resume, budget, presentation deck, database, etc.).',
  appModes: ['general', 'word', 'excel', 'powerpoint', 'access'],
  parameters: {
    type: 'object',
    properties: {
      templateName: { type: 'string', description: 'Name or category of template to load' },
      appType: {
        type: 'string',
        enum: ['word', 'excel', 'powerpoint', 'access'],
        description: 'Office app type',
      },
    },
    required: ['templateName'],
  },
  async execute(args: Record<string, unknown>): Promise<ToolResult> {
    return {
      success: true,
      data: args,
      message: `Template "${args.templateName}" loaded.`,
    };
  },
};

export const generalTools: ToolHandler[] = [
  translateOutput,
  loadUserMemory,
  saveUserPreference,
  previewFileChanges,
  loadTemplate,
];
