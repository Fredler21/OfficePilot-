'use client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolsUsed?: string[];
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function ChatMessage({ message, isStreaming }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-brand-600 text-white'
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-400">
            <span>🚀</span>
            <span className="font-medium">OfficePilot</span>
            {isStreaming && <span className="animate-pulse">●</span>}
          </div>
        )}

        <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>

        {message.toolsUsed && message.toolsUsed.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {message.toolsUsed.map((tool, i) => (
              <span
                key={`${tool}-${i}`}
                className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
              >
                🔧 {tool.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        <div className={`mt-1 text-xs ${isUser ? 'text-brand-200' : 'text-gray-300'}`}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
