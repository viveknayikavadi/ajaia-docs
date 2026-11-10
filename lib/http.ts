import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getCurrentUser } from './auth';
import { prisma } from './prisma';
import { getRole } from './access';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorResponse(err: unknown) {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) {
    return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }
  console.error(err);
  return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new HttpError(400, 'Request body must be valid JSON.');
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, 'Please sign in first.');
  return user;
}

/** Loads a document and the caller's role, or throws 404 / 403. */
export async function loadDocumentForUser(documentId: string, userId: string) {
  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    include: { shares: true },
  });
  if (!doc) throw new HttpError(404, 'Document not found.');
  const role = getRole(doc, userId);
  if (role === 'none') throw new HttpError(403, 'You do not have access to this document.');
  return { doc, role };
}
