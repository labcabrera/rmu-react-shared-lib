import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveJoinRequest,
  awardGroupXp,
  fetchGameMembers,
  fetchGameTimeLog,
  passTime,
  removeGameMember,
  removeJoinRequest,
  requestJoinGame,
  setGameMember,
} from './strategic-game.api';
import { gameAccessAtLeast } from './strategic-game.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const mockFetch = () => {
  const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({}), { status: 200 })));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('group experience api (spec 079)', () => {
  it('posts the experience of the group', async () => {
    const fetchMock = mockFetch();
    const body = { xp: 500, characterIds: ['c1'], eventType: 'session' as const };
    await awardGroupXp('g1', body, auth);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String(url)).toMatch(/\/strategic-games\/g1\/xp$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(String(init.body))).toEqual(body);
  });
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

describe('strategic game members api (spec 071)', () => {
  const call = (index = 0) => {
    const [url, init] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[index] as [string, RequestInit];
    return { url: String(url), method: init.method, body: init.body ? JSON.parse(String(init.body)) : undefined };
  };

  it('reads, sets and removes members', async () => {
    mockFetch();
    await fetchGameMembers('g1', auth);
    await setGameMember('g1', 'u/1', 'player', auth);
    await removeGameMember('g1', 'me', auth);
    expect(call(0)).toMatchObject({ method: 'GET' });
    expect(call(0).url).toMatch(/\/strategic-games\/g1\/members$/);
    expect(call(1)).toMatchObject({ method: 'PUT', body: { role: 'player' } });
    expect(call(1).url).toMatch(/\/members\/u%2F1$/);
    expect(call(2)).toMatchObject({ method: 'DELETE' });
    expect(call(2).url).toMatch(/\/members\/me$/);
  });

  it('asks to join, approves and rejects', async () => {
    mockFetch();
    await requestJoinGame('g1', 'hi', auth);
    await requestJoinGame('g1', undefined, auth);
    await approveJoinRequest('g1', 'u1', auth);
    await removeJoinRequest('g1', 'u1', auth);
    expect(call(0)).toMatchObject({ method: 'POST', body: { message: 'hi' } });
    expect(call(1).body).toEqual({});
    expect(call(2).url).toMatch(/\/join-requests\/u1\/approve$/);
    expect(call(3)).toMatchObject({ method: 'DELETE' });
  });

  it('compares access levels', () => {
    expect(gameAccessAtLeast('master', 'player')).toBe(true);
    expect(gameAccessAtLeast('cover', 'spectator')).toBe(false);
    expect(gameAccessAtLeast(undefined, 'cover')).toBe(false);
  });
});
