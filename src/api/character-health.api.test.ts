import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  addCharacterInjury,
  fetchCharacterHealingLog,
  resolveCharacterCondition,
  restCharacter,
  rollCharacterInjuryPermanent,
  rollCharacterInjuryRecovery,
  treatCharacterInjury,
  updateCharacterInjury,
} from './character-health.api';
import { applyTacticalGame, fetchFinishPreview, finishTacticalGame } from './tactical-game.api';

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

describe('character health api', () => {
  it.each([
    [
      'add injury',
      () => addCharacterInjury('c1', { type: 'bone', penalty: -10 }, auth),
      'POST',
      /\/characters\/c1\/injuries$/,
    ],
    [
      'update injury',
      () => updateCharacterInjury('c1', 'i1', { penalty: -5 }, auth),
      'PATCH',
      /\/characters\/c1\/injuries\/i1$/,
    ],
    [
      'treat injury',
      () =>
        treatCharacterInjury('c1', 'i1', { procedure: 'stitches', healer: { name: 'X', bonus: 20 }, roll: 50 }, auth),
      'POST',
      /\/characters\/c1\/injuries\/i1\/treatments$/,
    ],
    [
      'recovery roll',
      () => rollCharacterInjuryRecovery('c1', 'i1', { roll: 44 }, auth),
      'POST',
      /\/injuries\/i1\/recovery$/,
    ],
    [
      'permanent roll',
      () => rollCharacterInjuryPermanent('c1', 'i1', { roll: 12 }, auth),
      'POST',
      /\/injuries\/i1\/permanent$/,
    ],
    ['rest', () => restCharacter('c1', { days: 2, fullRest: true }, auth), 'POST', /\/characters\/c1\/rest$/],
    [
      'resolve condition',
      () => resolveCharacterCondition('c1', 'k1', auth),
      'POST',
      /\/characters\/c1\/conditions\/k1\/resolve$/,
    ],
    [
      'healing log',
      () => fetchCharacterHealingLog('c1', 0, 20, auth),
      'GET',
      /\/characters\/c1\/healing-log\?page=0&size=20$/,
    ],
  ])('%s', async (_, run, method, path) => {
    const fetchMock = mockFetch();
    await expect(run()).resolves.toEqual({ id: 'c1' });
    const { url, method: sent } = call(fetchMock);
    expect(url).toMatch(path);
    expect(sent).toBe(method);
  });

  it('sends the body of the treatment', async () => {
    const fetchMock = mockFetch();
    const dto = { procedure: 'pressure' as const, healerCharacterId: 'c2', roll: 70, difficulty: -10 };
    await treatCharacterInjury('c1', 'i1', dto, auth);
    expect(call(fetchMock).body).toEqual(dto);
  });
});

describe('tactical game finish api', () => {
  it('fetches the finish preview', async () => {
    const fetchMock = mockFetch();
    await fetchFinishPreview('g1', auth);
    expect(call(fetchMock)).toMatchObject({ method: 'GET' });
    expect(call(fetchMock).url).toMatch(/\/tactical-games\/g1\/finish-preview$/);
  });

  it('finishes with the fates', async () => {
    const fetchMock = mockFetch();
    const dto = { fates: [{ actorId: 'a1', fate: 'permanent-unconscious' as const }] };
    await finishTacticalGame('g1', dto, auth);
    expect(call(fetchMock)).toMatchObject({ method: 'POST', body: dto });
    expect(call(fetchMock).url).toMatch(/\/tactical-games\/g1\/finish$/);
  });

  it('applies the outcome', async () => {
    const fetchMock = mockFetch();
    await applyTacticalGame('g1', auth);
    expect(call(fetchMock)).toMatchObject({ method: 'POST' });
    expect(call(fetchMock).url).toMatch(/\/tactical-games\/g1\/apply$/);
  });
});
