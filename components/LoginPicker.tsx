'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, jsonInit } from './api';

type User = { id: string; name: string; email: string };

export default function LoginPicker({ users }: { users: User[] }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(userId: string) {
    setPending(userId);
    setError(null);
    try {
      await api('/api/session', jsonInit('POST', { userId }));
      router.push('/');
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
      setPending(null);
    }
  }

  return (
    <div className="user-list">
      {error && <div className="error" role="alert">{error}</div>}
      {users.map((u) => (
        <button key={u.id} className="user-option" onClick={() => signIn(u.id)} disabled={pending !== null}>
          <strong>{u.name}</strong>
          <span>{pending === u.id ? 'Signing in…' : u.email}</span>
        </button>
      ))}
    </div>
  );
}
