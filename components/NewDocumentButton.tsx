'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, jsonInit } from './api';

export default function NewDocumentButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setBusy(true);
    setError(null);
    try {
      const { id } = await api<{ id: string }>('/api/documents', jsonInit('POST', {}));
      router.push(`/docs/${id}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <>
      <button className="btn btn-primary" onClick={create} disabled={busy}>
        {busy ? 'Creating…' : 'New document'}
      </button>
      {error && <span className="error" role="alert">{error}</span>}
    </>
  );
}
