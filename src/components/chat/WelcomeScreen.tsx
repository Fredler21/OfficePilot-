'use client';

import type { AppMode } from '@/lib/types';

const SUGGESTIONS: Record<AppMode, { icon: string; text: string }[]> = {
  general: [
    { icon: '📝', text: 'Help me write a professional resume in Word' },
    { icon: '📊', text: 'Create a budget spreadsheet formula in Excel' },
    { icon: '📽️', text: 'Turn my notes into a 6-slide presentation' },
    { icon: '🗄️', text: 'Design a customer database in Access' },
  ],
  word: [
    { icon: '✍️', text: 'Rewrite this paragraph in academic tone' },
    { icon: '📋', text: 'Generate an outline for my research paper' },
    { icon: '📚', text: 'Format my citation in APA style' },
    { icon: '💼', text: 'Help me write a cover letter' },
  ],
  excel: [
    { icon: '🔢', text: 'Create a SUMIFS formula for conditional totals' },
    { icon: '🐛', text: 'Why is my VLOOKUP returning #N/A?' },
    { icon: '📈', text: 'What chart should I use for sales by region?' },
    { icon: '📊', text: 'Help me build a monthly budget tracker' },
  ],
  powerpoint: [
    { icon: '🎯', text: 'Turn my essay into a presentation outline' },
    { icon: '🎤', text: 'Generate speaker notes for my slides' },
    { icon: '✂️', text: 'Make my slides more concise' },
    { icon: '🎨', text: 'Suggest visuals for my data slide' },
  ],
  access: [
    { icon: '🏗️', text: 'Design tables for a small business inventory' },
    { icon: '🔗', text: 'Explain one-to-many relationships simply' },
    { icon: '🔍', text: 'Write a query to find top customers' },
    { icon: '📝', text: 'Help me create a data entry form' },
  ],
};

interface WelcomeScreenProps {
  appMode: AppMode;
  onSuggestionClick: (text: string) => void;
}

export function WelcomeScreen({ appMode, onSuggestionClick }: WelcomeScreenProps) {
  const suggestions = SUGGESTIONS[appMode] ?? SUGGESTIONS.general;

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <div className="max-w-xl text-center">
        <div className="mb-4 text-5xl">🚀</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to OfficePilot</h2>
        <p className="mb-8 text-gray-500">
          Your AI copilot for Microsoft Office. Ask me about Word, Excel, PowerPoint, or Access.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => onSuggestionClick(s.text)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 shadow-sm transition-all hover:border-brand-300 hover:shadow-md"
            >
              <span className="text-lg">{s.icon}</span>
              <span>{s.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400">
          <span>📝 Word</span>
          <span>📊 Excel</span>
          <span>📽️ PowerPoint</span>
          <span>🗄️ Access</span>
        </div>
      </div>
    </div>
  );
}
