import Anthropic from '@anthropic-ai/sdk';
import type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIToolCall,
} from './types';
import { AIProviderError } from '@/lib/errors';
import { logger } from '@/lib/logging';

type AnthropicMessage = Anthropic.MessageParam;

function toAnthropicMessages(messages: AICompletionRequest['messages']): {
  system: string;
  messages: AnthropicMessage[];
} {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  const result: AnthropicMessage[] = [];

  for (const msg of nonSystem) {
    if (msg.role === 'user') {
      result.push({ role: 'user', content: msg.content });
    } else if (msg.role === 'assistant') {
      const content: Anthropic.ContentBlock[] = [];
      if (msg.content) content.push({ type: 'text', text: msg.content } as Anthropic.ContentBlock);
      if (msg.tool_calls?.length) {
        for (const tc of msg.tool_calls) {
          let input: Record<string, unknown> = {};
          try { input = JSON.parse(tc.function.arguments); } catch { /* empty */ }
          content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input } as Anthropic.ContentBlock);
        }
      }
      if (content.length) result.push({ role: 'assistant', content });
    } else if (msg.role === 'tool') {
      let content: unknown = msg.content;
      try { content = JSON.parse(msg.content); } catch { /* use raw */ }
      result.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: msg.tool_call_id ?? '', content: JSON.stringify(content) }],
      });
    }
  }

  return { system: systemParts, messages: result };
}

function toAnthropicTools(tools: AICompletionRequest['tools']): Anthropic.Tool[] | undefined {
  if (!tools?.length) return undefined;
  return tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    input_schema: t.function.parameters as Anthropic.Tool['input_schema'],
  }));
}

export class ClaudeProvider implements AIProvider {
  public readonly name = 'claude';
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-haiku-20241022') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const { system, messages } = toAnthropicMessages(request.messages);
      const tools = toAnthropicTools(request.tools);

      const response = await this.client.messages.create({
        model: this.model,
        system: system || undefined,
        messages,
        tools,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      });

      const toolCalls: AIToolCall[] = [];
      let textContent = '';

      for (const block of response.content) {
        if (block.type === 'text') textContent += block.text;
        if (block.type === 'tool_use') {
          toolCalls.push({
            id: block.id,
            type: 'function',
            function: { name: block.name, arguments: JSON.stringify(block.input) },
          });
        }
      }

      const finishReason = response.stop_reason === 'tool_use' ? 'tool_calls' : 'stop';

      return {
        content: textContent || null,
        toolCalls,
        finishReason: finishReason as AICompletionResponse['finishReason'],
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (err) {
      logger.error('Claude completion failed', { error: String(err) });
      throw new AIProviderError('Failed to get AI completion', { provider: 'claude', error: String(err) });
    }
  }

  async *streamComplete(request: AICompletionRequest): AsyncIterable<AIStreamChunk> {
    try {
      const { system, messages } = toAnthropicMessages(request.messages);
      const tools = toAnthropicTools(request.tools);

      const stream = this.client.messages.stream({
        model: this.model,
        system: system || undefined,
        messages,
        tools,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      });

      const toolCalls: AIToolCall[] = [];
      let currentToolCall: { id: string; name: string; inputJson: string } | null = null;

      for await (const event of stream) {
        if (event.type === 'content_block_start') {
          if (event.content_block.type === 'tool_use') {
            currentToolCall = { id: event.content_block.id, name: event.content_block.name, inputJson: '' };
          }
        } else if (event.type === 'content_block_delta') {
          if (event.delta.type === 'text_delta') {
            yield { content: event.delta.text };
          } else if (event.delta.type === 'input_json_delta' && currentToolCall) {
            currentToolCall.inputJson += event.delta.partial_json;
          }
        } else if (event.type === 'content_block_stop') {
          if (currentToolCall) {
            toolCalls.push({
              id: currentToolCall.id,
              type: 'function',
              function: { name: currentToolCall.name, arguments: currentToolCall.inputJson || '{}' },
            });
            currentToolCall = null;
          }
        } else if (event.type === 'message_delta') {
          if (event.delta.stop_reason === 'tool_use' && toolCalls.length > 0) {
            yield { toolCalls, finishReason: 'tool_calls' };
          } else if (event.delta.stop_reason === 'end_turn') {
            yield { finishReason: 'stop' };
          }
        }
      }
    } catch (err) {
      logger.error('Claude stream failed', { error: String(err) });
      throw new AIProviderError('Failed to stream AI completion', { provider: 'claude', error: String(err) });
    }
  }
}
