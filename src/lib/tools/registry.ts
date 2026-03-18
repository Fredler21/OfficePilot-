import type { AIToolDefinition } from '@/lib/ai/types';

export interface ToolContext {
  sessionId: string;
  userId: string;
  appMode: string;
  language: string;
  fileContext?: string;
}

export interface ToolResult {
  success: boolean;
  data: unknown;
  message: string;
  requiresPreview?: boolean;
  previewData?: unknown;
}

export interface ToolHandler {
  name: string;
  description: string;
  appModes: string[];
  parameters: Record<string, unknown>;
  execute(args: Record<string, unknown>, context: ToolContext): Promise<ToolResult>;
}

export class ToolRegistry {
  private tools = new Map<string, ToolHandler>();

  register(handler: ToolHandler) {
    this.tools.set(handler.name, handler);
  }

  get(name: string): ToolHandler | undefined {
    return this.tools.get(name);
  }

  getForAppMode(appMode: string): ToolHandler[] {
    return Array.from(this.tools.values()).filter(
      (t) => t.appModes.includes(appMode) || t.appModes.includes('general')
    );
  }

  getAll(): ToolHandler[] {
    return Array.from(this.tools.values());
  }

  toAIToolDefinitions(appMode?: string): AIToolDefinition[] {
    const handlers = appMode ? this.getForAppMode(appMode) : this.getAll();
    return handlers.map((h) => ({
      type: 'function',
      function: {
        name: h.name,
        description: h.description,
        parameters: h.parameters,
      },
    }));
  }

  async execute(name: string, args: Record<string, unknown>, context: ToolContext): Promise<ToolResult> {
    const handler = this.tools.get(name);
    if (!handler) {
      return { success: false, data: null, message: `Unknown tool: ${name}` };
    }
    try {
      return await handler.execute(args, context);
    } catch (err) {
      return {
        success: false,
        data: null,
        message: `Tool '${name}' execution failed: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }
}

export const toolRegistry = new ToolRegistry();
