import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchCharacterSpells, restoreCharacterPower, spendCharacterPower } from './character.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const mockFetch = () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'c1' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const call = (fetchMock: ReturnType<typeof vi.fn>) => {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { url: String(url), method: init.method, body: init.body ? JSON.parse(String(init.body)) : undefined };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('character magic api (spec 029)', () => {
  it('reads the spells the character knows', async () => {
    const fetchMock = mockFetch();
    await fetchCharacterSpells('c1', auth);
    expect(call(fetchMock)).toMatchObject({ method: 'GET', url: expect.stringMatching(/\/characters\/c1\/spells$/) });
  });

  it.each([
    ['spend', () => spendCharacterPower('c1', 3, auth), /\/characters\/c1\/power\/spend$/],
    ['restore', () => restoreCharacterPower('c1', 3, auth), /\/characters\/c1\/power\/restore$/],
  ])('%ss power points', async (_, run, url) => {
    const fetchMock = mockFetch();
    await run();
    expect(call(fetchMock)).toMatchObject({ method: 'POST', url: expect.stringMatching(url), body: { amount: 3 } });
  });
});
