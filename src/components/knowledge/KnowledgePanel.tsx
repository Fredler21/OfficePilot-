'use client';

import { useState, useEffect, useCallback } from 'react';

interface KnowledgeSource {
  source: string;
  category: string;
  chunks: number;
  ingested_at: string;
}

export function KnowledgePanel() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      const res = await fetch('/api/knowledge', {
        headers: { 'x-admin-key': 'admin' },
      });
      const data = await res.json();
      if (data.success) {
        setSources(data.data.sources ?? []);
      }
    } catch {
      // Silently handle — non-critical
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    // Infer category from filename or default to 'general'
    const name = file.name.toLowerCase();
    let category = 'general';
    if (name.includes('word')) category = 'word';
    else if (name.includes('excel')) category = 'excel';
    else if (name.includes('powerpoint') || name.includes('ppt')) category = 'powerpoint';
    else if (name.includes('access')) category = 'access';
    formData.append('category', category);

    try {
      const res = await fetch('/api/knowledge/ingest', {
        method: 'POST',
        headers: { 'x-admin-key': 'admin' },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(`Ingested "${file.name}" — ${data.data.chunks} chunks created.`);
        fetchSources();
      } else {
        setError(data.errors?.[0]?.message ?? 'Upload failed.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (source: string) => {
    try {
      const res = await fetch(`/api/knowledge?source=${encodeURIComponent(source)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': 'admin' },
      });
      const data = await res.json();
      if (data.success) {
        fetchSources();
      }
    } catch {
      // Silently handle
    }
  };

  return (
    <section>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Knowledge Base</h3>
      <p className="mb-2 text-xs text-gray-400">Upload PDFs to build the AI&apos;s reference knowledge.</p>

      <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 transition-all hover:border-brand-400 hover:text-brand-600 ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
        <span>{uploading ? '⏳ Uploading...' : '📄 Upload PDF'}</span>
        <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {success && <p className="mt-1 text-xs text-green-600">{success}</p>}

      {sources.length > 0 && (
        <div className="mt-3 space-y-1">
          {sources.map((s) => (
            <div key={s.source} className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1.5 text-xs">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-gray-700">{s.source}</div>
                <div className="text-gray-400">{s.category} · {s.chunks} chunks</div>
              </div>
              <button
                onClick={() => handleDelete(s.source)}
                className="ml-2 shrink-0 rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                aria-label={`Delete ${s.source}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
