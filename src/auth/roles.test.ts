import { AuthContextProps } from 'react-oidc-context';
import { describe, expect, it } from 'vitest';
import { canEditEntity, isAdmin, userGroups } from './roles';

const authWith = (groups?: unknown, sub = 'owner-1') =>
  ({ user: { profile: { sub, groups } } }) as unknown as AuthContextProps;

describe('roles', () => {
  it('reads the groups claim', () => {
    expect(userGroups(authWith(['rmu-user', 'rmu-core-law']))).toEqual(['rmu-user', 'rmu-core-law']);
    expect(userGroups({ user: null } as unknown as AuthContextProps)).toEqual([]);
  });

  it('is admin only with the rmu-admin group', () => {
    expect(isAdmin(authWith(['rmu-user', 'rmu-admin']))).toBe(true);
    expect(isAdmin(authWith(['rmu-user']))).toBe(false);
    expect(isAdmin(authWith(undefined))).toBe(false);
  });

  describe('canEditEntity', () => {
    const admin = authWith(['rmu-user', 'rmu-admin'], 'admin-1');
    const owner = authWith(['rmu-user'], 'owner-1');
    const other = authWith(['rmu-user'], 'other-1');
    const system = { owner: 'owner-1', entitySource: 'system' as const };
    const user = { owner: 'owner-1', entitySource: 'user' as const };

    it.each([
      ['admin', admin, system, true],
      ['admin', admin, user, true],
      ['owner', owner, system, false],
      ['owner', owner, user, true],
      ['other', other, system, false],
      ['other', other, user, false],
    ])('%s on a %o entity: %s', (_who, auth, entity, expected) => {
      expect(canEditEntity(entity, auth)).toBe(expected);
    });

    it('counts a missing source as user', () => {
      expect(canEditEntity({ owner: 'owner-1' }, owner)).toBe(true);
      expect(canEditEntity({ owner: 'owner-1', entitySource: null }, other)).toBe(false);
    });

    it('denies without an entity, an owner or a signed-in user', () => {
      expect(canEditEntity(undefined, admin)).toBe(false);
      expect(canEditEntity(null, owner)).toBe(false);
      expect(canEditEntity({ entitySource: 'user' }, owner)).toBe(false);
      expect(canEditEntity(user, { user: null } as unknown as AuthContextProps)).toBe(false);
    });
  });
});
