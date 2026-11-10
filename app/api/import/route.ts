import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { HttpError, errorResponse, requireUser } from '@/lib/http';
import { MAX_UPLOAD_BYTES, SUPPORTED_LABEL, fileToHtml, isSupportedFile, titleFromFilename } from '@/lib/import';
import { MAX_CONTENT_CHARS } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Upload a .txt / .md / .docx file and turn it into a new editable document.
export async function POST(req: Request) {
  try {
    const user = await requireUser();

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new HttpError(400, 'Upload must be sent as a file.');
    }

    const file = form.get('file');
    if (!(file instanceof File)) throw new HttpError(400, 'No file was uploaded.');
    if (!isSupportedFile(file.name)) {
      throw new HttpError(400, `Unsupported file type. Supported: ${SUPPORTED_LABEL}`);
    }
    if (file.size === 0) throw new HttpError(400, 'The file is empty.');
    if (file.size > MAX_UPLOAD_BYTES) throw new HttpError(413, 'The file is larger than 1 MB.');

    let html: string;
    try {
      html = await fileToHtml(file.name, Buffer.from(await file.arrayBuffer()));
    } catch {
      throw new HttpError(422, 'This file could not be read. Check that it is a valid file.');
    }
    if (html.length > MAX_CONTENT_CHARS) throw new HttpError(413, 'The file content is too large.');

    const doc = await prisma.document.create({
      data: { title: titleFromFilename(file.name), content: html, ownerId: user.id },
      select: { id: true },
    });
    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    return errorResponse(err);
  }
}
