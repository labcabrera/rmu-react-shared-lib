import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchGameTimeLog, passTime } from './strategic-game.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const mockFetch = () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('strategic game time api (spec 065)', () => {
  it('passes time with the body', async () => {
    const fetchMock = mockFetch();
    const body = {
      days: 1,
      hours: 8,
      dryRun: true,
      version: 3,
      characters: [{ characterId: 'c1', activity: 'full-rest' as const }],
    };
    await passTime('g1', body, auth);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toMatch(/\/strategic-games\/g1\/pass-time$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(body);
  });

  it('reads a page of the time log', async () => {
    const fetchMock = mockFetch();
    await fetchGameTimeLog('g1', 2, 20, auth);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toMatch(/\/strategic-games\/g1\/time-log\?page=2&size=20$/);
    expect(init.method).toBe('GET');
  });
});
