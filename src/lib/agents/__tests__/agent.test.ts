import { describe, it, expect, vi, beforeAll } from 'vitest';
import { OfficePilotAgent } from '@/lib/agents/officepilot';
import { registerAllTools } from '@/lib/tools';
import type { AIProvider, AICompletionRequest, AICompletionResponse, AIStreamChunk } from '@/lib/ai/types';

// Mock AI Provider
function createMockProvider(response: Partial<AICompletionResponse>): AIProvider {
  return {
    name: 'mock',
    async complete(): Promise<AICompletionResponse> {
      return {
        content: response.content ?? 'Mock response',
        toolCalls: response.toolCalls ?? [],
        finishReason: response.finishReason ?? 'stop',
        usage: response.usage,
      };
    },
    async *streamComplete(): AsyncIterable<AIStreamChunk> {
      const text = response.content ?? 'Mock streamed response';
      for (const char of text) {
        yield { content: char };
      }
      yield { finishReason: 'stop' };
    },
  };
}

describe('OfficePilotAgent', () => {
  beforeAll(() => {
    registerAllTools();
  });

  it('runs a basic conversation', async () => {
    const provider = createMockProvider({ content: 'Here is a formula: =SUM(A1:A10)' });
    const agent = new OfficePilotAgent(provider);

    const result = await agent.run({
      sessionId: 'test-session',
      userId: 'test-user',
      userMessage: 'How do I sum a column in Excel?',
      appMode: 'excel',
      language: 'en',
    });

    expect(result.content).toContain('SUM');
    expect(result.metadata.appMode).toBe('excel');
    expect(result.metadata.language).toBe('en');
  });

  it('handles tool calls', async () => {
    let callCount = 0;
    const provider: AIProvider = {
      name: 'mock-tools',
      async complete(req: AICompletionRequest): Promise<AICompletionResponse> {
        callCount++;
        if (callCount === 1) {
          return {
            content: '',
            toolCalls: [
              {
                id: 'tc-1',
                type: 'function',
                function: {
                  name: 'build_excel_formula',
                  arguments: JSON.stringify({ intent: 'sum A column' }),
                },
              },
            ],
            finishReason: 'tool_calls',
          };
        }
        return {
          content: 'Use =SUM(A:A) to sum the entire A column.',
          toolCalls: [],
          finishReason: 'stop',
        };
      },
      async *streamComplete(): AsyncIterable<AIStreamChunk> {
        yield { content: 'streamed' };
        yield { finishReason: 'stop' };
      },
    };

    const agent = new OfficePilotAgent(provider);
    const result = await agent.run({
      sessionId: 'test-session',
      userId: 'test-user',
      userMessage: 'Sum column A',
      appMode: 'excel',
      language: 'en',
    });

    expect(result.toolsUsed).toContain('build_excel_formula');
    expect(result.content).toContain('SUM');
  });

  it('streams responses', async () => {
    const provider = createMockProvider({ content: 'Streaming test response' });
    const agent = new OfficePilotAgent(provider);

    const events: string[] = [];
    for await (const event of agent.stream({
      sessionId: 'test-session',
      userId: 'test-user',
      userMessage: 'test',
      appMode: 'general',
      language: 'en',
    })) {
      events.push(event.type);
      if (event.type === 'content' && event.content) {
        // Content is streamed character by character in mock
      }
    }

    expect(events).toContain('content');
    expect(events).toContain('done');
  });

  it('respects max tool rounds', async () => {
    let calls = 0;
    const infiniteToolProvider: AIProvider = {
      name: 'infinite',
      async complete(): Promise<AICompletionResponse> {
        calls++;
        return {
          content: '',
          toolCalls: [
            {
              id: `tc-${calls}`,
              type: 'function',
              function: { name: 'load_template', arguments: '{"templateName":"test"}' },
            },
          ],
          finishReason: 'tool_calls',
        };
      },
      async *streamComplete(): AsyncIterable<AIStreamChunk> {
        yield { finishReason: 'stop' };
      },
    };

    const agent = new OfficePilotAgent(infiniteToolProvider);
    const result = await agent.run({
      sessionId: 'test',
      userId: 'test',
      userMessage: 'test',
      appMode: 'general',
      language: 'en',
    });

    // Should stop after MAX_TOOL_ROUNDS (8) iterations
    expect(calls).toBeLessThanOrEqual(8);
    expect(result.toolsUsed.length).toBeGreaterThan(0);
  });
});
