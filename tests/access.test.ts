import { describe, expect, it } from 'vitest';
import { can, getRole } from '@/lib/access';

const doc = { ownerId: 'alice', shares: [{ userId: 'bob' }] };

describe('document access rules', () => {
  it('gives the owner the owner role', () => {
    expect(getRole(doc, 'alice')).toBe('owner');
  });

  it('gives a user the document was shared with the editor role', () => {
    expect(getRole(doc, 'bob')).toBe('editor');
  });

  it('gives everyone else no access', () => {
    expect(getRole(doc, 'carol')).toBe('none');
    expect(getRole(doc, '')).toBe('none');
  });

  it('lets only the owner rename, share and delete', () => {
    expect(can.rename('owner')).toBe(true);
    expect(can.share('owner')).toBe(true);
    expect(can.delete('owner')).toBe(true);

    expect(can.rename('editor')).toBe(false);
    expect(can.share('editor')).toBe(false);
    expect(can.delete('editor')).toBe(false);
  });

  it('lets owners and shared users edit content, but not strangers', () => {
    expect(can.editContent('owner')).toBe(true);
    expect(can.editContent('editor')).toBe(true);
    expect(can.editContent('none')).toBe(false);
    expect(can.view('none')).toBe(false);
  });

  it('removing a share removes access', () => {
    const unshared = { ...doc, shares: [] };
    expect(getRole(unshared, 'bob')).toBe('none');
  });
});
