import { cookies } from 'next/headers';
import { prisma } from './prisma';

/**
 * Mocked authentication: the signed-in user id lives in an httpOnly cookie.
 * Users pick a seeded demo account on /login. There are no passwords by design
 * (the brief allows seeded accounts / mocked auth to keep scope reasonable).
 */
export const SESSION_COOKIE = 'ajaia_user';

export async function getCurrentUser() {
  const id = cookies().get(SESSION_COOKIE)?.value;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}
