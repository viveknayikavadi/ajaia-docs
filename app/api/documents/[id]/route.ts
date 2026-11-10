import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HttpError, errorResponse, loadDocumentForUser, readJson, requireUser } from '@/lib/http';
import { can } from '@/lib/access';
import { updateDocumentSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { doc, role } = await loadDocumentForUser(params.id, user.id);
    return NextResponse.json({
      document: { id: doc.id, title: doc.title, content: doc.content, updatedAt: doc.updatedAt },
      role,
    });
  } catch (err) {
    return errorResponse(err);
  }
}

// Save content and/or rename.
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { role } = await loadDocumentForUser(params.id, user.id);
    const data = updateDocumentSchema.parse(await readJson(req));

    if (data.title !== undefined && !can.rename(role)) {
      throw new HttpError(403, 'Only the owner can rename this document.');
    }
    if (data.content !== undefined && !can.editContent(role)) {
      throw new HttpError(403, 'You cannot edit this document.');
    }

    const updated = await prisma.document.update({
      where: { id: params.id },
      data,
      select: { id: true, title: true, updatedAt: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const user = await requireUser();
    const { role } = await loadDocumentForUser(params.id, user.id);
    if (!can.delete(role)) throw new HttpError(403, 'Only the owner can delete this document.');
    await prisma.document.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
