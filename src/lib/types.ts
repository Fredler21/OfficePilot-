export type AppMode = 'word' | 'excel' | 'powerpoint' | 'access' | 'general';

export interface Session {
  id: string;
  userId: string;
  appMode: AppMode;
  title: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCalls?: string;
  toolCallId?: string;
  createdAt: string;
}

export interface UserPreference {
  key: string;
  value: string;
}

export interface MemoryEntry {
  id: string;
  userId: string;
  category: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FileRecord {
  id: string;
  sessionId: string | null;
  userId: string | null;
  filename: string;
  fileType: string;
  fileSize: number | null;
  parsedContext: string | null;
  createdAt: string;
}

export interface ActionPreview {
  id: string;
  sessionId: string;
  actionType: string;
  description: string;
  previewData: unknown;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  createdAt: string;
}

export interface Template {
  id: string;
  name: string;
  appType: AppMode;
  category: string;
  description: string | null;
  content: string;
  language: string;
}
