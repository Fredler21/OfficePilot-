'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { FileUpload } from './FileUpload';
import { WelcomeScreen } from './WelcomeScreen';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  timestamp: Date;
}

interface ChatPanelProps {
  appMode: AppMode;
  language: SupportedLanguage;
  sessionId: string | null;
  onSessionChange: (id: string | null) => void;
  learningMode: string;
}

export function ChatPanel({
  appMode,
  language,
  sessionId,
  onSessionChange,
  learningMode,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContext, setFileContext] = useState<string | null>(null);
  const [streamContent, setStreamContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setStreamContent('');

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          sessionId,
          appMode,
          language,
          fileContext,
          learningMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const newSessionId = response.headers.get('X-Session-Id');
      if (newSessionId && !sessionId) {
        onSessionChange(newSessionId);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let accumulated = '';
      const toolsUsed: string[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const event = JSON.parse(data);
            switch (event.type) {
              case 'content':
                if (event.content) {
                  accumulated += event.content;
                  setStreamContent(accumulated);
                }
                break;
              case 'tool_start':
                if (event.toolName) toolsUsed.push(event.toolName);
                break;
              case 'error':
                accumulated += `\n\n⚠️ ${event.error}`;
                setStreamContent(accumulated);
                break;
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-resp`,
        role: 'assistant',
        content: accumulated,
        toolsUsed: toolsUsed.length > 0 ? toolsUsed : undefined,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamContent('');
    } catch (err) {
      // Fall back to non-streaming
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            sessionId,
            appMode,
            language,
            fileContext,
            learningMode,
          }),
        });

        const result = await response.json();

        if (result.success) {
          if (result.data.sessionId && !sessionId) {
            onSessionChange(result.data.sessionId);
          }

          const assistantMessage: Message = {
            id: `msg-${Date.now()}-resp`,
            role: 'assistant',
            content: result.data.response,
            toolsUsed: result.data.toolsUsed,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, assistantMessage]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}-err`,
              role: 'assistant',
              content: `⚠️ ${result.errors?.[0]?.message || 'Something went wrong. Please try again.'}`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-err`,
            role: 'assistant',
            content: '⚠️ Unable to connect. Please check your connection and try again.',
            timestamp: new Date(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUploaded = (context: string) => {
    setFileContext(context);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-file`,
        role: 'assistant',
        content: '📎 File loaded! I can now see your document. Ask me anything about it.',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col">
      {messages.length === 0 && !isLoading ? (
        <WelcomeScreen appMode={appMode} onSuggestionClick={handleSend} />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {streamContent && (
              <ChatMessage
                message={{
                  id: 'streaming',
                  role: 'assistant',
                  content: streamContent,
                  timestamp: new Date(),
                }}
                isStreaming
              />
            )}
            {isLoading && !streamContent && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="flex gap-1">
                  <span className="animate-bounce">●</span>
                  <span className="animate-bounce [animation-delay:150ms]">●</span>
                  <span className="animate-bounce [animation-delay:300ms]">●</span>
                </div>
                <span>OfficePilot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <FileUpload onFileUploaded={handleFileUploaded} sessionId={sessionId} />
          </div>
          <ChatInput
            onSend={handleSend}
            isLoading={isLoading}
            appMode={appMode}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}
