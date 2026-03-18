export interface AIMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  tool_call_id?: string;
  tool_calls?: AIToolCall[];
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AICompletionRequest {
  messages: AIMessage[];
  tools?: AIToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AICompletionResponse {
  content: string | null;
  toolCalls: AIToolCall[];
  finishReason: 'stop' | 'tool_calls' | 'length' | 'content_filter';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIStreamChunk {
  content?: string;
  toolCalls?: AIToolCall[];
  finishReason?: string;
}

export interface AIProvider {
  name: string;
  complete(request: AICompletionRequest): Promise<AICompletionResponse>;
  streamComplete(request: AICompletionRequest): AsyncIterable<AIStreamChunk>;
}
