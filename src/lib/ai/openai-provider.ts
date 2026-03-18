import OpenAI from 'openai';
import type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIToolCall,
} from './types';
import { AIProviderError } from '@/lib/errors';
import { logger } from '@/lib/logging';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'openai';
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o') {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: request.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: request.tools as OpenAI.Chat.Completions.ChatCompletionTool[] | undefined,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
      });

      const choice = response.choices[0];
      const toolCalls: AIToolCall[] = (choice.message.tool_calls ?? []).map((tc) => ({
        id: tc.id,
        type: 'function' as const,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      }));

      return {
        content: choice.message.content,
        toolCalls,
        finishReason: choice.finish_reason as AICompletionResponse['finishReason'],
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (err) {
      logger.error('OpenAI completion failed', { error: String(err) });
      throw new AIProviderError('Failed to get AI completion', { provider: 'openai', error: String(err) });
    }
  }

  async *streamComplete(request: AICompletionRequest): AsyncIterable<AIStreamChunk> {
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages: request.messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: request.tools as OpenAI.Chat.Completions.ChatCompletionTool[] | undefined,
        temperature: request.temperature ?? 0.7,
        max_tokens: request.maxTokens ?? 4096,
        stream: true,
      });

      const toolCallAccumulator = new Map<number, AIToolCall>();

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (!delta) continue;

        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const idx = tc.index;
            if (!toolCallAccumulator.has(idx)) {
              toolCallAccumulator.set(idx, {
                id: tc.id ?? '',
                type: 'function',
                function: { name: tc.function?.name ?? '', arguments: '' },
              });
            }
            const existing = toolCallAccumulator.get(idx)!;
            if (tc.id) existing.id = tc.id;
            if (tc.function?.name) existing.function.name = tc.function.name;
            if (tc.function?.arguments) existing.function.arguments += tc.function.arguments;
          }
        }

        const finishReason = chunk.choices[0]?.finish_reason ?? undefined;

        yield {
          content: delta.content ?? undefined,
          toolCalls:
            finishReason === 'tool_calls'
              ? Array.from(toolCallAccumulator.values())
              : undefined,
          finishReason: finishReason ?? undefined,
        };
      }
    } catch (err) {
      logger.error('OpenAI stream failed', { error: String(err) });
      throw new AIProviderError('Failed to stream AI completion', { provider: 'openai', error: String(err) });
    }
  }
}
