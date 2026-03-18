import type { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';
import { GeminiProvider } from './gemini-provider';
import { ClaudeProvider } from './claude-provider';
import { getConfig } from '@/lib/config';

export type { AIProvider, AIMessage, AICompletionRequest, AICompletionResponse, AIStreamChunk, AIToolCall, AIToolDefinition } from './types';
export { OpenAIProvider } from './openai-provider';
export { GeminiProvider } from './gemini-provider';
export { ClaudeProvider } from './claude-provider';

let _provider: AIProvider | null = null;

export function getAIProvider(providerOverride?: 'openai' | 'gemini' | 'claude'): AIProvider {
  const config = getConfig();
  const providerName = providerOverride ?? config.AI_PROVIDER;

  if (_provider && _provider.name === providerName) return _provider;

  if (providerName === 'gemini') {
    _provider = new GeminiProvider(config.GEMINI_API_KEY);
  } else if (providerName === 'claude') {
    _provider = new ClaudeProvider(config.ANTHROPIC_API_KEY);
  } else {
    _provider = new OpenAIProvider(config.OPENAI_API_KEY);
  }
  return _provider;
}

export function setAIProvider(provider: AIProvider) {
  _provider = provider;
}
