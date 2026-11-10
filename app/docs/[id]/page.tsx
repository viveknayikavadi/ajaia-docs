import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRole } from '@/lib/access';
import DocumentEditor from '@/components/DocumentEditor';

export const dynamic = 'force-dynamic';

export default async function DocumentPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const doc = await prisma.document.findUnique({
    where: { id: params.id },
    include: {
      owner: { select: { name: true } },
      shares: { orderBy: { createdAt: 'asc' }, include: { user: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!doc) notFound();

  const role = getRole(doc, user.id);
  if (role === 'none') {
    return (
      <div className="notice">
        <h1 style={{ fontSize: 20, marginTop: 0 }}>You don’t have access to this document</h1>
        <p className="hint">Ask the owner to share it with {user.email}.</p>
        <p><Link href="/">Back to my documents</Link></p>
      </div>
    );
  }

  return (
    <DocumentEditor
      doc={{ id: doc.id, title: doc.title, content: doc.content, ownerName: doc.owner.name }}
      role={role}
      currentUserName={user.name}
      initialShares={doc.shares.map((s) => s.user)}
    />
  );
}
