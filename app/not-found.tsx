import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="notice">
      <h1 style={{ fontSize: 20, marginTop: 0 }}>Document not found</h1>
      <p className="hint">It may have been deleted, or the link is wrong.</p>
      <p><Link href="/">Back to my documents</Link></p>
    </div>
  );
}
