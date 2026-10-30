import { AuthContextProps } from 'react-oidc-context';
import { describe, expect, it } from 'vitest';
import { isAdmin, userGroups } from './roles';

const authWith = (groups?: unknown) => ({ user: { profile: { groups } } }) as unknown as AuthContextProps;

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
});
