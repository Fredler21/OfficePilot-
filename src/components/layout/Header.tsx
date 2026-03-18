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
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">⭐ Upgrade Your Plan</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1 hover:bg-gray-100 text-gray-500 text-xl leading-none">&times;</button>
            </div>
            <p className="mb-6 text-sm text-gray-500">Supercharge your productivity with a plan that fits your needs.</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Pro */}
              <div className="rounded-xl border-2 border-orange-400 p-4 relative">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-orange-400 px-3 py-0.5 text-xs font-bold text-white">POPULAR</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pro</h3>
                <div className="text-2xl font-bold text-orange-500 mb-3">$9.99<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>✅ 200 messages/day</li>
                  <li>✅ 10 PDF documents</li>
                  <li>✅ Smarter responses</li>
                  <li>✅ Full conversation history</li>
                  <li>✅ Priority support</li>
                </ul>
                <button onClick={() => setShowModal(false)} className="mt-4 w-full rounded-lg bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
                  Coming Soon
                </button>
              </div>

              {/* Business */}
              <div className="rounded-xl border-2 border-gray-200 p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Business</h3>
                <div className="text-2xl font-bold text-gray-800 mb-3">$24.99<span className="text-sm font-normal text-gray-400">/mo</span></div>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li>✅ Unlimited messages</li>
                  <li>✅ Unlimited documents</li>
                  <li>✅ Highest accuracy</li>
                  <li>✅ Advanced formatting tools</li>
                  <li>✅ Team features</li>
                </ul>
                <button onClick={() => setShowModal(false)} className="mt-4 w-full rounded-lg bg-gray-800 py-2 text-sm font-semibold text-white hover:bg-gray-900 transition-colors">
                  Coming Soon
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">Free plan: 20 messages/day · 1 PDF · No credit card required</p>
          </div>
        </div>
      )}
    </>
  );
}
