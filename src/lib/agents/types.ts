import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';

export interface AgentInput {
  sessionId: string;
  userId: string;
  userMessage: string;
  appMode: AppMode;
  language: SupportedLanguage;
  fileContext?: string;
  learningMode?: 'doforme' | 'walkthrough' | 'beginner' | 'both';
}

export interface AgentOutput {
  content: string;
  toolsUsed: string[];
  requiresApproval: boolean;
  previews: AgentPreview[];
  metadata: {
    appMode: AppMode;
    language: string;
    tokensUsed?: number;
  };
}

export interface AgentPreview {
  id: string;
  actionType: string;
  description: string;
  previewData: unknown;
}

export interface AgentStreamEvent {
  type: 'content' | 'tool_start' | 'tool_result' | 'preview' | 'done' | 'error';
  content?: string;
  toolName?: string;
  toolResult?: unknown;
  preview?: AgentPreview;
  error?: string;
  metadata?: Record<string, unknown>;
}
