import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'OfficePilot — AI Copilot for Microsoft Office',
  description: 'Your AI productivity copilot for Word, Excel, PowerPoint, and Access.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
