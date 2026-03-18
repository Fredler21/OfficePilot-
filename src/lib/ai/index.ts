import type { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { getConfig } from '@/lib/config';

export type { AIProvider, AIMessage, AICompletionRequest, AICompletionResponse, AIStreamChunk, AIToolCall, AIToolDefinition } from './types';
export { OpenAIProvider } from './openai-provider';

let _provider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (_provider) return _provider;
  const config = getConfig();
  _provider = new OpenAIProvider(config.OPENAI_API_KEY);
  return _provider;
}

export function setAIProvider(provider: AIProvider) {
  _provider = provider;
}
