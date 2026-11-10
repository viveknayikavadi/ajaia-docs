/**
 * Access rules for documents. Kept pure (no database) so they are easy to test.
 *
 * - owner:  full control (edit, rename, share, delete)
 * - editor: a user the owner shared the document with (can view and edit content)
 * - none:   no access
 */
export type Role = 'owner' | 'editor' | 'none';

export interface AccessDoc {
  ownerId: string;
  shares: { userId: string }[];
}

export function getRole(doc: AccessDoc, userId: string): Role {
  if (!userId) return 'none';
  if (doc.ownerId === userId) return 'owner';
  if (doc.shares.some((s) => s.userId === userId)) return 'editor';
  return 'none';
}

export const can = {
  view: (role: Role) => role !== 'none',
  editContent: (role: Role) => role === 'owner' || role === 'editor',
  rename: (role: Role) => role === 'owner',
  share: (role: Role) => role === 'owner',
  delete: (role: Role) => role === 'owner',
};
