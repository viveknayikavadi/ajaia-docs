'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from './api';

const ACCEPT = '.txt,.md,.docx';
const MAX_BYTES = 1_000_000;

export default function UploadButton() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again
    if (!file) return;
    setError(null);

    // Quick client-side checks; the server checks again.
    if (!/\.(txt|md|docx)$/i.test(file.name)) {
      setError('Unsupported file type. Supported: .txt, .md, .docx');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('The file is larger than 1 MB.');
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const { id } = await api<{ id: string }>('/api/import', { method: 'POST', body });
      router.push(`/docs/${id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <input ref={input} type="file" accept={ACCEPT} hidden onChange={onChange} />
      <button className="btn" onClick={() => input.current?.click()} disabled={busy}>
        {busy ? 'Importing…' : 'Upload file'}
      </button>
      {error && <span className="error" role="alert">{error}</span>}
    </>
  );
}
