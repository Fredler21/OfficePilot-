import { GoogleGenerativeAI, type Content, type Tool, type FunctionDeclaration } from '@google/generative-ai';
import type {
  AIProvider,
  AICompletionRequest,
  AICompletionResponse,
  AIStreamChunk,
  AIToolCall,
  AIMessage,
} from './types';
import { AIProviderError } from '@/lib/errors';
import { logger } from '@/lib/logging';

// Map our internal messages to Gemini's Content format
function toGeminiMessages(messages: AIMessage[]): { systemInstruction: string; history: Content[]; lastUserMessage: string } {
  const systemParts = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n\n');
  const nonSystem = messages.filter((m) => m.role !== 'system');

  const history: Content[] = [];
  let lastUserMessage = '';

  for (let i = 0; i < nonSystem.length; i++) {
    const msg = nonSystem[i];

    if (msg.role === 'user') {
      if (i === nonSystem.length - 1) {
        lastUserMessage = msg.content;
      } else {
        history.push({ role: 'user', parts: [{ text: msg.content }] });
      }
    } else if (msg.role === 'assistant') {
      const parts: Content['parts'] = [];
      if (msg.content) parts.push({ text: msg.content });
      if (msg.tool_calls?.length) {
        for (const tc of msg.tool_calls) {
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(tc.function.arguments); } catch { /* empty */ }
          parts.push({ functionCall: { name: tc.function.name, args } });
        }
      }
      if (parts.length) history.push({ role: 'model', parts });
    } else if (msg.role === 'tool') {
      let response: unknown = msg.content;
      try { response = JSON.parse(msg.content); } catch { /* use raw string */ }
      history.push({
        role: 'user',
        parts: [{ functionResponse: { name: msg.tool_call_id ?? 'tool', response: { result: response } } }],
      });
    }
  }

  return { systemInstruction: systemParts, history, lastUserMessage };
}

// Convert our tool definitions to Gemini's format
function toGeminiTools(tools: AICompletionRequest['tools']): Tool[] | undefined {
  if (!tools?.length) return undefined;
  const declarations: FunctionDeclaration[] = tools.map((t) => ({
    name: t.function.name,
    description: t.function.description,
    parameters: t.function.parameters as unknown as FunctionDeclaration['parameters'],
  }));
  return [{ functionDeclarations: declarations }];
}

export class GeminiProvider implements AIProvider {
  public readonly name = 'gemini';
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = model;
  }

  async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
    try {
      const { systemInstruction, history, lastUserMessage } = toGeminiMessages(request.messages);
      const geminiTools = toGeminiTools(request.tools);

      const genModel = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: systemInstruction || undefined,
        tools: geminiTools,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 4096,
        },
      });

      const chat = genModel.startChat({ history });
      const result = await chat.sendMessage(lastUserMessage);
      const response = result.response;
      const candidate = response.candidates?.[0];

      const toolCalls: AIToolCall[] = [];
      let textContent = '';

      for (const part of candidate?.content?.parts ?? []) {
        if ('text' in part && part.text) textContent += part.text;
        if ('functionCall' in part && part.functionCall) {
          toolCalls.push({
            id: `gemini-${part.functionCall.name}-${Date.now()}`,
            type: 'function',
            function: {
              name: part.functionCall.name,
              arguments: JSON.stringify(part.functionCall.args ?? {}),
            },
          });
        }
      }

      const finishReason = toolCalls.length > 0 ? 'tool_calls' : 'stop';

      return {
        content: textContent || null,
        toolCalls,
        finishReason: finishReason as AICompletionResponse['finishReason'],
        usage: {
          promptTokens: response.usageMetadata?.promptTokenCount ?? 0,
          completionTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
          totalTokens: response.usageMetadata?.totalTokenCount ?? 0,
        },
      };
    } catch (err) {
      logger.error('Gemini completion failed', { error: String(err) });
      throw new AIProviderError('Failed to get AI completion', { provider: 'gemini', error: String(err) });
    }
  }

  async *streamComplete(request: AICompletionRequest): AsyncIterable<AIStreamChunk> {
    try {
      const { systemInstruction, history, lastUserMessage } = toGeminiMessages(request.messages);
      const geminiTools = toGeminiTools(request.tools);

      const genModel = this.client.getGenerativeModel({
        model: this.model,
        systemInstruction: systemInstruction || undefined,
        tools: geminiTools,
        generationConfig: {
          temperature: request.temperature ?? 0.7,
          maxOutputTokens: request.maxTokens ?? 4096,
        },
      });

      const chat = genModel.startChat({ history });
      const result = await chat.sendMessageStream(lastUserMessage);

      const toolCalls: AIToolCall[] = [];
      let hasToolCalls = false;

      for await (const chunk of result.stream) {
        const candidate = chunk.candidates?.[0];
        if (!candidate) continue;

        let chunkText = '';
        for (const part of candidate.content?.parts ?? []) {
          if ('text' in part && part.text) chunkText += part.text;
          if ('functionCall' in part && part.functionCall) {
            hasToolCalls = true;
            toolCalls.push({
              id: `gemini-${part.functionCall.name}-${Date.now()}`,
              type: 'function',
              function: {
                name: part.functionCall.name,
                arguments: JSON.stringify(part.functionCall.args ?? {}),
              },
            });
          }
        }

        if (chunkText) yield { content: chunkText };
      }

      if (hasToolCalls) {
        yield { toolCalls, finishReason: 'tool_calls' };
      } else {
        yield { finishReason: 'stop' };
      }
    } catch (err) {
      logger.error('Gemini stream failed', { error: String(err) });
      throw new AIProviderError('Failed to stream AI completion', { provider: 'gemini', error: String(err) });
    }
  }
}
