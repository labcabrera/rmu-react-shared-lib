import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyRace } from './race.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('race api', () => {
  it('copies a race with a POST of the name and the realm (spec 074)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'new' }), { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(copyRace('race-1', { name: 'Elf (copy)', realmId: 'realm-2' }, auth)).resolves.toEqual({ id: 'new' });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/races\/race-1\/copy$/);
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual({ name: 'Elf (copy)', realmId: 'realm-2' });
  });
});
