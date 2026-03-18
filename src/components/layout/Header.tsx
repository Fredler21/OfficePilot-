'use client';

import type { AppMode } from '@/lib/types';

const APP_MODES: { id: AppMode; label: string; color: string; icon: string }[] = [
  { id: 'general', label: 'General', color: 'bg-brand-500', icon: '🏠' },
  { id: 'word', label: 'Word', color: 'bg-[#2b579a]', icon: '📝' },
  { id: 'excel', label: 'Excel', color: 'bg-[#217346]', icon: '📊' },
  { id: 'powerpoint', label: 'PowerPoint', color: 'bg-[#d24726]', icon: '📽️' },
  { id: 'access', label: 'Access', color: 'bg-[#a4373a]', icon: '🗄️' },
];

interface HeaderProps {
  appMode: AppMode;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ appMode, sidebarOpen, onToggleSidebar }: HeaderProps) {
  const mode = APP_MODES.find((m) => m.id === appMode) ?? APP_MODES[0];

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {!sidebarOpen && (
          <button
            onClick={onToggleSidebar}
            className="rounded-md p-2 hover:bg-gray-100"
            aria-label="Open sidebar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          <h1 className="text-xl font-bold text-gray-900">OfficePilot</h1>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full ${mode.color} px-3 py-1 text-sm font-medium text-white`}>
          <span>{mode.icon}</span>
          <span>{mode.label}</span>
        </div>
      </div>
      <div className="text-sm text-gray-500">AI Formatting Assistant for Microsoft Office</div>
    </header>
  );
}
