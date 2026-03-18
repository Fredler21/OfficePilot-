'use client';

import { useState } from 'react';
import { ChatPanel } from '@/components/chat/ChatPanel';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import type { AppMode } from '@/lib/types';
import type { SupportedLanguage } from '@/lib/i18n';

export default function Home() {
  const [appMode, setAppMode] = useState<AppMode>('general');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [learningMode, setLearningMode] = useState<string>('both');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <Sidebar
          appMode={appMode}
          onAppModeChange={setAppMode}
          language={language}
          onLanguageChange={setLanguage}
          learningMode={learningMode}
          onLearningModeChange={setLearningMode}
          onClose={() => setSidebarOpen(false)}
        />
      )}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          appMode={appMode}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="flex-1 overflow-hidden">
          <ChatPanel
            appMode={appMode}
            language={language}
            sessionId={sessionId}
            onSessionChange={setSessionId}
            learningMode={learningMode}
          />
        </main>
      </div>
    </div>
  );
}
