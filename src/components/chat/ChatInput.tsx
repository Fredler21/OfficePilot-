'use client';

import { useState, useRef, useEffect } from 'react';
import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';

const PLACEHOLDERS: Record<string, Record<AppMode, string>> = {
  en: {
    general: 'Ask me anything about Word, Excel, PowerPoint, or Access...',
    word: 'Ask about writing, formatting, citations, or document structure...',
    excel: 'Ask about formulas, charts, data analysis, or spreadsheet errors...',
    powerpoint: 'Ask about slides, presentations, speaker notes, or visuals...',
    access: 'Ask about tables, relationships, queries, or database design...',
  },
  fr: {
    general: 'Posez-moi des questions sur Word, Excel, PowerPoint ou Access...',
    word: 'Questions sur la rédaction, le formatage, les citations...',
    excel: 'Questions sur les formules, graphiques, analyse de données...',
    powerpoint: 'Questions sur les diapositives, présentations, notes...',
    access: 'Questions sur les tables, relations, requêtes...',
  },
  ht: {
    general: 'Mande m nenpòt bagay sou Word, Excel, PowerPoint, oswa Access...',
    word: 'Mande sou ekriti, fòmataj, sitasyon...',
    excel: 'Mande sou fòmil, grafik, analiz done...',
    powerpoint: 'Mande sou eslid, prezantasyon, nòt...',
    access: 'Mande sou tab, relasyon, rechèch...',
  },
};

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  appMode: AppMode;
  language: SupportedLanguage;
}

export function ChatInput({ onSend, isLoading, appMode, language }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const placeholder = PLACEHOLDERS[language]?.[appMode] ?? PLACEHOLDERS.en[appMode] ?? PLACEHOLDERS.en.general;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isLoading}
        rows={1}
        className="flex-1 resize-none rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        aria-label="Chat message input"
      />
      <button
        onClick={handleSubmit}
        disabled={!input.trim() || isLoading}
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m-7 7l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
