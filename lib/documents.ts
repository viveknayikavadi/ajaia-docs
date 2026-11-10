import { prisma } from './prisma';

export async function listDocumentsForUser(userId: string) {
  const [owned, shared] = await Promise.all([
    prisma.document.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, _count: { select: { shares: true } } },
    }),
    prisma.document.findMany({
      where: { shares: { some: { userId } } },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, owner: { select: { name: true, email: true } } },
    }),
  ]);
  return { owned, shared };
}
