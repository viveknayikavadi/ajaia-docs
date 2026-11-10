import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HttpError, errorResponse, loadDocumentForUser, readJson, requireUser } from '@/lib/http';
import { can } from '@/lib/access';
import { shareSchema, unshareSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

async function listShares(documentId: string) {
  const shares = await prisma.documentShare.findMany({
    where: { documentId },
    orderBy: { createdAt: 'asc' },
    select: { user: { select: { id: true, name: true, email: true } } },
  });
  return shares.map((s) => s.user);
}

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    await loadDocumentForUser(params.id, user.id);
    return NextResponse.json({ shares: await listShares(params.id) });
  } catch (err) {
    return errorResponse(err);
  }
}

// Owner grants another user access by email.
export async function POST(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { doc, role } = await loadDocumentForUser(params.id, user.id);
    if (!can.share(role)) throw new HttpError(403, 'Only the owner can share this document.');

    const { email } = shareSchema.parse(await readJson(req));
    const target = await prisma.user.findUnique({ where: { email } });
    if (!target) throw new HttpError(404, `No user found with ${email}. Use one of the demo accounts.`);
    if (target.id === doc.ownerId) throw new HttpError(400, 'You already own this document.');

    await prisma.documentShare.upsert({
      where: { documentId_userId: { documentId: doc.id, userId: target.id } },
      update: {},
      create: { documentId: doc.id, userId: target.id },
    });
    return NextResponse.json({ shares: await listShares(doc.id) }, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}

// Owner removes a user's access.
export async function DELETE(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { doc, role } = await loadDocumentForUser(params.id, user.id);
    if (!can.share(role)) throw new HttpError(403, 'Only the owner can change sharing.');

    const { userId } = unshareSchema.parse(await readJson(req));
    await prisma.documentShare.deleteMany({ where: { documentId: doc.id, userId } });
    return NextResponse.json({ shares: await listShares(doc.id) });
  } catch (err) {
    return errorResponse(err);
  }
}
