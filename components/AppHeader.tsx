import Link from 'next/link';
import SignOutButton from './SignOutButton';

export default function AppHeader({ name, email }: { name: string; email: string }) {
  return (
    <header className="app-header">
      <Link href="/" className="brand">Ajaia Docs</Link>
      <div className="who">
        <span>
          Signed in as <strong>{name}</strong> ({email})
        </span>
        <SignOutButton />
      </div>
    </header>
  );
}
