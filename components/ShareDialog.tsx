'use client';

import { useEffect, useRef, useState } from 'react';
import { api, jsonInit } from './api';

export type ShareUser = { id: string; name: string; email: string };

interface Props {
  docId: string;
  isOwner: boolean;
  ownerName: string;
  shares: ShareUser[];
  onChange: (shares: ShareUser[]) => void;
  onClose: () => void;
}

export default function ShareDialog({ docId, isOwner, ownerName, shares, onChange, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const url = `/api/documents/${docId}/shares`;

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function share(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) {
      setError('Enter an email address.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await api<{ shares: ShareUser[] }>(url, jsonInit('POST', { email: value }));
      onChange(data.shares);
      setNotice(`Shared with ${value.toLowerCase()}.`);
      setEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(user: ShareUser) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const data = await api<{ shares: ShareUser[] }>(url, jsonInit('DELETE', { userId: user.id }));
      onChange(data.shares);
      setNotice(`Removed access for ${user.email}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="share-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="share-panel" role="dialog" aria-modal="true" aria-labelledby="share-title">
        <h2 id="share-title">Share document</h2>
        {isOwner ? (
          <>
            <p className="hint">People you share with can open and edit this document. Only you can rename it or change sharing.</p>
            <form className="share-form" onSubmit={share}>
              <input
                ref={inputRef}
                type="email"
                placeholder="bob@ajaia.test"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
              />
              <button className="btn btn-primary" type="submit" disabled={busy}>
                {busy ? 'Sharing…' : 'Share'}
              </button>
            </form>
          </>
        ) : (
          <p className="hint">Only the owner, {ownerName}, can change who has access.</p>
        )}

        {error && <div className="error" role="alert">{error}</div>}
        {notice && <p className="hint" role="status">{notice}</p>}

        <ul className="share-list">
          <li>
            <span>{ownerName}</span>
            <span className="badge badge-owner">Owner</span>
          </li>
          {shares.map((u) => (
            <li key={u.id}>
              <span>
                {u.name} <span className="muted">{u.email}</span>
              </span>
              {isOwner ? (
                <button className="btn-link" onClick={() => remove(u)} disabled={busy}>Remove</button>
              ) : (
                <span className="badge badge-shared">Can edit</span>
              )}
            </li>
          ))}
        </ul>

        <div className="share-footer">
          <button className="btn" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
