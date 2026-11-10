'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Toolbar from './Toolbar';
import ShareDialog, { type ShareUser } from './ShareDialog';
import { api, jsonInit } from './api';
import type { Role } from '@/lib/access';

const SAVE_DELAY_MS = 800;

type SaveState = 'saved' | 'unsaved' | 'saving' | 'error';

const STATUS_LABEL: Record<SaveState, string> = {
  saved: 'All changes saved',
  unsaved: 'Unsaved changes',
  saving: 'Saving…',
  error: 'Not saved',
};

interface Props {
  doc: { id: string; title: string; content: string; ownerName: string };
  role: Role;
  currentUserName: string;
  initialShares: ShareUser[];
}

export default function DocumentEditor({ doc, role, initialShares }: Props) {
  const router = useRouter();
  const isOwner = role === 'owner';

  const [title, setTitle] = useState(doc.title);
  const savedTitle = useRef(doc.title);
  const [status, setStatus] = useState<SaveState>('saved');
  const [error, setError] = useState<string | null>(null);
  const [shares, setShares] = useState<ShareUser[]>(initialShares);
  const [shareOpen, setShareOpen] = useState(false);

  // Autosave bookkeeping: latest unsaved HTML, debounce timer, and the request in flight.
  const pending = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef<Promise<void> | null>(null);
  const url = `/api/documents/${doc.id}`;

  const flush = useCallback(async (): Promise<void> => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    if (inFlight.current) await inFlight.current;
    const content = pending.current;
    if (content === null) return;
    pending.current = null;
    setStatus('saving');

    const request = (async () => {
      try {
        await api(url, jsonInit('PATCH', { content }));
        setError(null);
        setStatus(pending.current === null ? 'saved' : 'unsaved');
      } catch (e) {
        if (pending.current === null) pending.current = content; // keep it for a retry
        setStatus('error');
        setError((e as Error).message);
      }
    })();
    inFlight.current = request;
    await request;
    inFlight.current = null;
  }, [url]);

  const scheduleSave = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), SAVE_DELAY_MS);
  }, [flush]);

  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [1, 2, 3] } }), Underline],
    content: doc.content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { 'aria-label': 'Document content' } },
    onUpdate: ({ editor }) => {
      pending.current = editor.getHTML();
      setStatus('unsaved');
      scheduleSave();
    },
  });

  // Warn before closing the tab with unsaved work, and send it anyway if possible.
  useEffect(() => {
    const sendBeacon = () => {
      if (pending.current === null) return;
      fetch(url, { ...jsonInit('PATCH', { content: pending.current }), keepalive: true }).catch(() => undefined);
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current !== null || inFlight.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pagehide', sendBeacon);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pagehide', sendBeacon);
      if (timer.current) clearTimeout(timer.current);
      sendBeacon();
    };
  }, [url]);

  useEffect(() => {
    document.title = `${title || 'Untitled'} – Ajaia Docs`;
  }, [title]);

  async function commitTitle() {
    const next = title.trim();
    if (!next) {
      setTitle(savedTitle.current);
      setError('Title cannot be empty.');
      return;
    }
    if (next === savedTitle.current) {
      setTitle(next);
      return;
    }
    try {
      await api(url, jsonInit('PATCH', { title: next }));
      savedTitle.current = next;
      setTitle(next);
      setError(null);
    } catch (e) {
      setTitle(savedTitle.current);
      setError((e as Error).message);
    }
  }

  async function goBack() {
    await flush();
    router.push('/');
    router.refresh();
  }

  return (
    <>
      <div className="editor-bar">
        <div className="editor-bar-top">
          <button className="btn" onClick={goBack}>Back to documents</button>
          <input
            className="title-input"
            aria-label="Document title"
            value={title}
            maxLength={200}
            readOnly={!isOwner}
            title={isOwner ? 'Rename document' : 'Only the owner can rename this document'}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
              if (e.key === 'Escape') {
                setTitle(savedTitle.current);
                (e.target as HTMLInputElement).blur();
              }
            }}
          />
          <span className={`badge ${isOwner ? 'badge-owner' : 'badge-shared'}`}>
            {isOwner ? 'Owner' : `Shared by ${doc.ownerName}`}
          </span>
          <span className={`save-status${status === 'error' ? ' is-error' : ''}`} aria-live="polite">
            {STATUS_LABEL[status]}
          </span>
          {status === 'error' && (
            <button className="btn" onClick={() => void flush()}>Retry</button>
          )}
          <button className="btn btn-primary" onClick={() => setShareOpen(true)}>
            Share{shares.length ? ` (${shares.length})` : ''}
          </button>
        </div>
        <Toolbar editor={editor} />
        {error && (
          <div style={{ padding: '0 24px 10px' }}>
            <div className="error" role="alert">{error}</div>
          </div>
        )}
      </div>

      <div className="page-wrap">
        <div className="page">
          <EditorContent editor={editor} />
        </div>
      </div>

      {shareOpen && (
        <ShareDialog
          docId={doc.id}
          isOwner={isOwner}
          ownerName={doc.ownerName}
          shares={shares}
          onChange={setShares}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}
