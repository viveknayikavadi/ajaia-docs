import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { listDocumentsForUser } from '@/lib/documents';
import AppHeader from '@/components/AppHeader';
import NewDocumentButton from '@/components/NewDocumentButton';
import UploadButton from '@/components/UploadButton';

export const dynamic = 'force-dynamic';

function formatDate(d: Date) {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'UTC' }).format(d) + ' UTC';
}

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const { owned, shared } = await listDocumentsForUser(user.id);

  return (
    <>
      <AppHeader name={user.name} email={user.email} />
      <main className="dashboard">
        <div className="actions">
          <NewDocumentButton />
          <UploadButton />
        </div>
        <p className="hint">Upload a .txt, .md or .docx file (up to 1 MB) to turn it into a new editable document.</p>

        <section className="doc-section" aria-labelledby="owned-heading">
          <h2 id="owned-heading">
            My documents <small>{owned.length}</small>
          </h2>
          {owned.length === 0 ? (
            <div className="empty">You have no documents yet. Create one or upload a file to get started.</div>
          ) : (
            <ul className="doc-list">
              {owned.map((d) => (
                <li key={d.id}>
                  <Link className="doc-row" href={`/docs/${d.id}`}>
                    <span className="doc-title">{d.title}</span>
                    {d._count.shares > 0 && (
                      <span className="doc-meta">Shared with {d._count.shares}</span>
                    )}
                    <span className="badge badge-owner">Owner</span>
                    <span className="doc-meta">{formatDate(d.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="doc-section" aria-labelledby="shared-heading">
          <h2 id="shared-heading">
            Shared with me <small>{shared.length}</small>
          </h2>
          {shared.length === 0 ? (
            <div className="empty">Nothing has been shared with you yet.</div>
          ) : (
            <ul className="doc-list">
              {shared.map((d) => (
                <li key={d.id}>
                  <Link className="doc-row" href={`/docs/${d.id}`}>
                    <span className="doc-title">{d.title}</span>
                    <span className="badge badge-shared">Shared by {d.owner.name}</span>
                    <span className="doc-meta">{formatDate(d.updatedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </>
  );
}
