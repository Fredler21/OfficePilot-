import { describe, it, expect, beforeEach } from 'vitest';
import { ToolRegistry } from '@/lib/tools/registry';
import type { ToolHandler, ToolContext } from '@/lib/tools/registry';

const mockContext: ToolContext = {
  sessionId: 'test-session',
  userId: 'test-user',
  appMode: 'general',
  language: 'en',
};

const mockTool: ToolHandler = {
  name: 'test_tool',
  description: 'A test tool',
  appModes: ['general', 'word'],
  parameters: { type: 'object', properties: {} },
  async execute(args) {
    return { success: true, data: args, message: 'Test executed' };
  },
};

const excelTool: ToolHandler = {
  name: 'excel_only_tool',
  description: 'Excel only tool',
  appModes: ['excel'],
  parameters: { type: 'object', properties: {} },
  async execute() {
    return { success: true, data: null, message: 'Excel tool executed' };
  },
};

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('registers and retrieves tools', () => {
    registry.register(mockTool);
    expect(registry.get('test_tool')).toBe(mockTool);
  });

  it('returns undefined for unknown tools', () => {
    expect(registry.get('nonexistent')).toBeUndefined();
  });

  it('filters tools by app mode', () => {
    registry.register(mockTool);
    registry.register(excelTool);

    const wordTools = registry.getForAppMode('word');
    expect(wordTools.map((t) => t.name)).toContain('test_tool');
    expect(wordTools.map((t) => t.name)).not.toContain('excel_only_tool');

    const excelTools = registry.getForAppMode('excel');
    expect(excelTools.map((t) => t.name)).toContain('test_tool'); // general tools included
    expect(excelTools.map((t) => t.name)).toContain('excel_only_tool');
  });

  it('generates AI tool definitions', () => {
    registry.register(mockTool);
    const defs = registry.toAIToolDefinitions();
    expect(defs).toHaveLength(1);
    expect(defs[0].type).toBe('function');
    expect(defs[0].function.name).toBe('test_tool');
  });

  it('executes tools successfully', async () => {
    registry.register(mockTool);
    const result = await registry.execute('test_tool', { foo: 'bar' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ foo: 'bar' });
  });

  it('returns error for unknown tool execution', async () => {
    const result = await registry.execute('nonexistent', {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Unknown tool');
  });

  it('catches tool execution errors', async () => {
    const failingTool: ToolHandler = {
      name: 'failing_tool',
      description: 'Fails',
      appModes: ['general'],
      parameters: { type: 'object', properties: {} },
      async execute() {
        throw new Error('Tool crashed');
      },
    };
    registry.register(failingTool);
    const result = await registry.execute('failing_tool', {}, mockContext);
    expect(result.success).toBe(false);
    expect(result.message).toContain('Tool crashed');
  });
});
