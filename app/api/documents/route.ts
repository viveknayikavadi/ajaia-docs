import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { errorResponse, requireUser } from '@/lib/http';
import { createDocumentSchema } from '@/lib/validation';
import { listDocumentsForUser } from '@/lib/documents';

export const dynamic = 'force-dynamic';

// List documents the user owns and documents shared with them.
export async function GET() {
  try {
    const user = await requireUser();
    return NextResponse.json(await listDocumentsForUser(user.id));
  } catch (err) {
    return errorResponse(err);
  }
}

// Create a new empty document.
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json().catch(() => ({}));
    const { title } = createDocumentSchema.parse(body ?? {});
    const doc = await prisma.document.create({
      data: { title: title ?? 'Untitled document', content: '<p></p>', ownerId: user.id },
      select: { id: true },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
