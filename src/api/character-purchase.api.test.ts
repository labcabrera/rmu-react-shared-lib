import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { addCharacterTrait, recalculateCharacter } from './character.api';
import { GM_TRAIT_ACQUISITION_TYPES, TRAIT_ACQUISITION_TYPES } from './character.dto';
import { restCharacter } from './character-health.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const mockFetch = () => {
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ id: 'c1' }), { status: 200 }));
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

describe('character purchase and recalculation api (spec 077)', () => {
  it('recalculates a character', async () => {
    const fetchMock = mockFetch();
    await recalculateCharacter('c1', auth);
    expect(call(fetchMock)).toMatchObject({ method: 'POST', url: expect.stringMatching(/\/characters\/c1\/recalculate$/) });
  });

  it('sends the prerequisite, the link and the restriction of a trait', async () => {
    const fetchMock = mockFetch();
    await addCharacterTrait(
      'c1',
      {
        traitId: 'light-sensitivity',
        tier: 1,
        specialization: undefined,
        prerequisite: { type: 'training', note: 'Guild' },
        linkedTo: { traitId: 'nightvision' },
        restricted: { note: 'Underground' },
      },
      auth
    );
    expect(call(fetchMock).body).toEqual({
      traitId: 'light-sensitivity',
      tier: 1,
      prerequisite: { type: 'training', note: 'Guild' },
      linkedTo: { traitId: 'nightvision' },
      restricted: { note: 'Underground' },
    });
  });

  it('sends the minutes of a rest', async () => {
    const fetchMock = mockFetch();
    await restCharacter('c1', { minutes: 45 }, auth);
    expect(call(fetchMock).body).toEqual({ minutes: 45 });
  });

  it('only lets the game master grant training and milestone', () => {
    expect(GM_TRAIT_ACQUISITION_TYPES).toEqual(['training', 'milestone']);
    GM_TRAIT_ACQUISITION_TYPES.forEach((type) => expect(TRAIT_ACQUISITION_TYPES).toContain(type));
  });
});
