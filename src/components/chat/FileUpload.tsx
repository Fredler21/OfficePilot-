'use client';

import { useRef, useState } from 'react';

interface FileUploadProps {
  onFileUploaded: (context: string) => void;
  sessionId: string | null;
}

export function FileUpload({ onFileUploaded, sessionId }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (sessionId) formData.append('sessionId', sessionId);

      const response = await fetch('/api/files/parse', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        const contextStr = result.data.context
          .map((s: { type: string; title?: string; preview: string }) =>
            `[${s.type}${s.title ? `: ${s.title}` : ''}] ${s.preview}`
          )
          .join('\n');
        onFileUploaded(contextStr);
      } else {
        alert(result.errors?.[0]?.message || 'Failed to parse file');
        setFileName(null);
      }
    } catch {
      alert('Failed to upload file');
      setFileName(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx,.xlsx,.xls,.csv,.pptx"
        onChange={handleChange}
        className="hidden"
        aria-label="Upload file"
      />
      <button
        onClick={handleClick}
        disabled={uploading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        {uploading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <span>📎</span>
            <span>{fileName ?? 'Upload file'}</span>
          </>
        )}
      </button>
      {fileName && !uploading && (
        <span className="text-xs text-green-600">✓ {fileName}</span>
      )}
    </>
  );
}
