import { v4 as uuid } from 'uuid';
import type { AIMessage } from '@/lib/ai/types';
import type { AIProvider } from '@/lib/ai';
import { toolRegistry } from '@/lib/tools';
import type { ToolContext } from '@/lib/tools';
import { buildSystemPrompt } from './prompts';
import { buildKnowledgeContext } from '@/lib/knowledge';
import type { AgentInput, AgentOutput, AgentPreview, AgentStreamEvent } from './types';
import { logger } from '@/lib/logging';

const MAX_TOOL_ROUNDS = 8;

export class OfficePilotAgent {
  private provider: AIProvider;

  constructor(provider: AIProvider) {
    this.provider = provider;
  }

  async run(input: AgentInput): Promise<AgentOutput> {
    const knowledgeContext = buildKnowledgeContext(input.userMessage, input.appMode);
    const systemPrompt = buildSystemPrompt(
      input.appMode,
      input.language,
      input.fileContext,
      input.learningMode,
      undefined,
      knowledgeContext || undefined
    );

    const toolDefs = toolRegistry.toAIToolDefinitions(input.appMode);
    const toolContext: ToolContext = {
      sessionId: input.sessionId,
      userId: input.userId,
      appMode: input.appMode,
      language: input.language,
      fileContext: input.fileContext,
    };

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input.userMessage },
    ];

    const toolsUsed: string[] = [];
    const previews: AgentPreview[] = [];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      const response = await this.provider.complete({
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        temperature: 0.7,
        maxTokens: 4096,
      });

      if (response.finishReason === 'stop' || response.toolCalls.length === 0) {
        return {
          content: response.content ?? '',
          toolsUsed,
          requiresApproval: previews.length > 0,
          previews,
          metadata: {
            appMode: input.appMode,
            language: input.language,
            tokensUsed: response.usage?.totalTokens,
          },
        };
      }

      // Process tool calls
      messages.push({
        role: 'assistant',
        content: response.content ?? '',
        tool_calls: response.toolCalls,
      });

      for (const tc of response.toolCalls) {
        const toolName = tc.function.name;
        toolsUsed.push(toolName);
        logger.info(`Agent calling tool: ${toolName}`, { sessionId: input.sessionId });

        let args: Record<string, unknown>;
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }

        const result = await toolRegistry.execute(toolName, args, toolContext);

        if (result.requiresPreview && result.previewData) {
          previews.push({
            id: uuid(),
            actionType: toolName,
            description: result.message,
            previewData: result.previewData,
          });
        }

        messages.push({
          role: 'tool',
          content: JSON.stringify({ success: result.success, message: result.message, data: result.data }),
          tool_call_id: tc.id,
        });
      }
    }

    // Exhausted rounds
    const lastContent = messages.filter((m) => m.role === 'assistant').pop()?.content ?? '';
    return {
      content: lastContent || 'I completed processing the request with the available tools.',
      toolsUsed,
      requiresApproval: previews.length > 0,
      previews,
      metadata: { appMode: input.appMode, language: input.language },
    };
  }

  async *stream(input: AgentInput): AsyncIterable<AgentStreamEvent> {
    const knowledgeContext = buildKnowledgeContext(input.userMessage, input.appMode);
    const systemPrompt = buildSystemPrompt(
      input.appMode,
      input.language,
      input.fileContext,
      input.learningMode,
      undefined,
      knowledgeContext || undefined
    );

    const toolDefs = toolRegistry.toAIToolDefinitions(input.appMode);
    const toolContext: ToolContext = {
      sessionId: input.sessionId,
      userId: input.userId,
      appMode: input.appMode,
      language: input.language,
      fileContext: input.fileContext,
    };

    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input.userMessage },
    ];

    for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
      let accumulatedContent = '';
      let toolCalls: AIMessage['tool_calls'] = undefined;
      let finishReason = '';

      for await (const chunk of this.provider.streamComplete({
        messages,
        tools: toolDefs.length > 0 ? toolDefs : undefined,
        temperature: 0.7,
        maxTokens: 4096,
        stream: true,
      })) {
        if (chunk.content) {
          accumulatedContent += chunk.content;
          yield { type: 'content', content: chunk.content };
        }
        if (chunk.toolCalls) {
          toolCalls = chunk.toolCalls;
        }
        if (chunk.finishReason) {
          finishReason = chunk.finishReason;
        }
      }

      if (finishReason === 'stop' || !toolCalls || toolCalls.length === 0) {
        yield { type: 'done', metadata: { appMode: input.appMode, language: input.language } };
        return;
      }

      // Process tool calls
      messages.push({
        role: 'assistant',
        content: accumulatedContent,
        tool_calls: toolCalls,
      });

      for (const tc of toolCalls) {
        const toolName = tc.function.name;
        yield { type: 'tool_start', toolName };

        let args: Record<string, unknown>;
        try {
          args = JSON.parse(tc.function.arguments);
        } catch {
          args = {};
        }

        const result = await toolRegistry.execute(toolName, args, toolContext);
        yield { type: 'tool_result', toolName, toolResult: result };

        if (result.requiresPreview && result.previewData) {
          yield {
            type: 'preview',
            preview: {
              id: uuid(),
              actionType: toolName,
              description: result.message,
              previewData: result.previewData,
            },
          };
        }

        messages.push({
          role: 'tool',
          content: JSON.stringify({ success: result.success, message: result.message, data: result.data }),
          tool_call_id: tc.id,
        });
      }
    }

    yield { type: 'done', metadata: { appMode: input.appMode, language: input.language } };
  }
}
