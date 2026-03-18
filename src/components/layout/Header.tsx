'use client';

import { useState } from 'react';
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
  const [showModal, setShowModal] = useState(false);

  return (
    <>
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
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-gray-500 sm:block">AI Formatting Assistant for Microsoft Office</span>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:from-yellow-500 hover:to-orange-600 transition-all"
          >
            ⭐ Upgrade to Premium
          </button>
        </div>
      </header>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">⭐ Premium Plan</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1 hover:bg-gray-100 text-gray-500 text-xl leading-none">&times;</button>
            </div>
            <p className="mb-5 text-sm text-gray-500">Take your productivity to the next level with advanced AI capabilities designed for professionals.</p>
            <ul className="mb-6 space-y-3 text-sm">
              {[
                ['✨', 'Advanced AI', 'Higher accuracy, deeper reasoning & complex document analysis'],
                ['📂', 'Unlimited Knowledge Base', 'Upload unlimited reference documents & manuals'],
                ['⚡', 'Priority Responses', 'Faster answers with no rate limits'],
                ['🔁', 'Full Conversation History', 'Access and search all past sessions'],
                ['🛠️', 'Advanced Formatting Tools', 'Templates, batch fixes & style enforcement'],
              ].map(([icon, title, desc]) => (
                <li key={title} className="flex items-start gap-3">
                  <span className="text-lg">{icon}</span>
                  <div>
                    <span className="font-semibold text-gray-800">{title}</span>
                    <span className="text-gray-500"> — {desc}</span>
                  </div>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 py-3 font-semibold text-white hover:from-yellow-500 hover:to-orange-600 transition-all"
            >
              Coming Soon — Get Notified
            </button>
            <p className="mt-3 text-center text-xs text-gray-400">No credit card required to get started for free.</p>
          </div>
        </div>
      )}
    </>
  );
}
