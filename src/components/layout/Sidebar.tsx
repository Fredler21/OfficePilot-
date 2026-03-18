'use client';

import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';
import { KnowledgePanel } from '@/components/knowledge/KnowledgePanel';

const APP_MODES: { id: AppMode; label: string; color: string; icon: string; description: string }[] = [
  { id: 'general', label: 'General', color: 'border-brand-500 text-brand-600', icon: '🏠', description: 'All Office apps' },
  { id: 'word', label: 'Word', color: 'border-[#2b579a] text-[#2b579a]', icon: '📝', description: 'Formatting & structure' },
  { id: 'excel', label: 'Excel', color: 'border-[#217346] text-[#217346]', icon: '📊', description: 'Spreadsheets & data' },
  { id: 'powerpoint', label: 'PowerPoint', color: 'border-[#d24726] text-[#d24726]', icon: '📽️', description: 'Presentations' },
  { id: 'access', label: 'Access', color: 'border-[#a4373a] text-[#a4373a]', icon: '🗄️', description: 'Databases' },
];

const LANGUAGES: { id: SupportedLanguage; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇺🇸' },
  { id: 'fr', label: 'Français', flag: '🇫🇷' },
  { id: 'ht', label: 'Kreyòl', flag: '🇭🇹' },
];

const LEARNING_MODES = [
  { id: 'doforme', label: '⚡ Do it for me', description: 'Quick direct answers' },
  { id: 'walkthrough', label: '🚶 Walk me through', description: 'Step-by-step guide' },
  { id: 'beginner', label: '🎓 Beginner mode', description: 'Simple explanations' },
  { id: 'both', label: '📋 Answer + Steps', description: 'Full answer with explanation' },
];

interface SidebarProps {
  appMode: AppMode;
  onAppModeChange: (mode: AppMode) => void;
  language: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  learningMode: string;
  onLearningModeChange: (mode: string) => void;
  onClose: () => void;
}

export function Sidebar({
  appMode,
  onAppModeChange,
  language,
  onLanguageChange,
  learningMode,
  onLearningModeChange,
  onClose,
}: SidebarProps) {
  return (
    <aside className="flex w-72 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <span className="text-sm font-semibold text-gray-700">Settings</span>
        <button onClick={onClose} className="rounded p-1 hover:bg-gray-100" aria-label="Close sidebar">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* App Mode */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Office App</h3>
          <div className="space-y-1">
            {APP_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onAppModeChange(mode.id)}
                className={`flex w-full items-center gap-3 rounded-lg border-2 px-3 py-2 text-left transition-all ${
                  appMode === mode.id
                    ? `${mode.color} border-current bg-gray-50 font-medium`
                    : 'border-transparent text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{mode.icon}</span>
                <div>
                  <div className="text-sm font-medium">{mode.label}</div>
                  <div className="text-xs text-gray-400">{mode.description}</div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Language */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Language</h3>
          <div className="flex gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                onClick={() => onLanguageChange(lang.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-lg border-2 px-2 py-2 text-xs transition-all ${
                  language === lang.id
                    ? 'border-brand-500 bg-brand-50 font-medium text-brand-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Learning Mode */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Learning Mode</h3>
          <div className="space-y-1">
            {LEARNING_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => onLearningModeChange(mode.id)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                  learningMode === mode.id
                    ? 'bg-brand-50 font-medium text-brand-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {getQuickActions(appMode).map((action) => (
              <button
                key={action.label}
                className="rounded-lg border border-gray-200 px-2 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                {action.icon} {action.label}
              </button>
            ))}
          </div>
        </section>

        {/* Knowledge Base */}
        <KnowledgePanel />
      </div>
    </aside>
  );
}

function getQuickActions(appMode: AppMode) {
  const common = [
    { icon: '�', label: 'Format Check' },
    { icon: '📚', label: 'Citations' },
    { icon: '🌐', label: 'Translate' },
    { icon: '📄', label: 'Template' },
  ];

  switch (appMode) {
    case 'word':
      return [...common, { icon: '📋', label: 'Structure' }, { icon: '🔤', label: 'Styles' }];
    case 'excel':
      return [{ icon: '🔢', label: 'Formula' }, { icon: '💡', label: 'Explain' }, { icon: '📈', label: 'Chart' }, { icon: '🐛', label: 'Debug' }, ...common.slice(0, 2)];
    case 'powerpoint':
      return [{ icon: '🎯', label: 'Layout' }, { icon: '🎨', label: 'Theme' }, { icon: '✂️', label: 'Compress' }, { icon: '🖼️', label: 'Visuals' }, ...common.slice(0, 2)];
    case 'access':
      return [{ icon: '🏗️', label: 'Schema' }, { icon: '🔗', label: 'Relations' }, { icon: '🔍', label: 'Query' }, { icon: '📝', label: 'Form' }, ...common.slice(0, 2)];
    default:
      return common;
  }
}
