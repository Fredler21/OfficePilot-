'use client';

import type { AppMode } from '@/lib/types';

const SUGGESTIONS: Record<AppMode, { icon: string; text: string }[]> = {
  general: [
    { icon: '�', text: 'Check if my document follows APA 7th edition format' },
    { icon: '📊', text: 'Help me fix my VLOOKUP formula in Excel' },
    { icon: '📽️', text: 'How do I set slide master layouts in PowerPoint?' },
    { icon: '🗄️', text: 'Show me how to create a relationship between tables in Access' },
  ],
  word: [
    { icon: '📐', text: 'Check my document formatting against APA 7th edition' },
    { icon: '📚', text: 'Format this citation in MLA 9th edition style' },
    { icon: '📋', text: 'Validate my heading hierarchy and document structure' },
    { icon: '📄', text: 'Generate an APA research paper template with correct margins' },
  ],
  excel: [
    { icon: '🔢', text: 'Create a SUMIFS formula for conditional totals' },
    { icon: '🐛', text: 'Why is my VLOOKUP returning #N/A?' },
    { icon: '📈', text: 'What chart type should I use for sales by region?' },
    { icon: '💡', text: 'Explain how INDEX MATCH works step by step' },
  ],
  powerpoint: [
    { icon: '🎯', text: 'How do I set up slide masters for consistent formatting?' },
    { icon: '📐', text: 'What are the best layout principles for data slides?' },
    { icon: '🎨', text: 'How do I apply a consistent color theme across all slides?' },
    { icon: '✂️', text: 'Show me how to crop and align images on a slide' },
  ],
  access: [
    { icon: '🏗️', text: 'How do I normalize my database tables correctly?' },
    { icon: '🔗', text: 'Explain one-to-many relationships simply' },
    { icon: '🔍', text: 'Walk me through writing a parameter query' },
    { icon: '📝', text: 'How do I create a data entry form with validation?' },
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
        <div className="mb-4 text-5xl">�</div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Welcome to OfficePilot</h2>
        <p className="mb-8 text-gray-500">
          Your AI formatting assistant for Microsoft Office. I help you format, structure, and optimize your documents — not write them for you.
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
