'use client';

import { useRouter } from 'next/navigation';

export default function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch('/api/session', { method: 'DELETE' }).catch(() => undefined);
    router.push('/login');
    router.refresh();
  }
  return (
    <button className="btn" onClick={signOut}>
      Switch user
    </button>
  );
}
