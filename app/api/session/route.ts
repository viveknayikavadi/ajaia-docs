import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE } from '@/lib/auth';
import { HttpError, errorResponse, readJson } from '@/lib/http';
import { sessionSchema } from '@/lib/validation';

// Sign in as a seeded demo user.
export async function POST(req: Request) {
  try {
    const { userId } = sessionSchema.parse(await readJson(req));
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new HttpError(404, 'That user does not exist.');

    const res = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email } });
    res.cookies.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}

// Sign out.
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
