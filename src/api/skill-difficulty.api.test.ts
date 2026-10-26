import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchSkillDifficulties, fetchSkillDifficulty } from './skill-difficulty.api';
import { localizedText } from './skill-difficulty.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('skill difficulty api (spec 037)', () => {
  it.each([
    ['fetches the guide of a skill', () => fetchSkillDifficulty('a b', auth), /\/skill-difficulties\/a%20b$/],
    ['lists every guide', () => fetchSkillDifficulties(auth), /\/skill-difficulties$/],
  ])('%s', async (_, call, url) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(call()).resolves.toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(url);
  });

  it('picks the Spanish text when there is one', () => {
    expect(localizedText({ en: 'wall', es: 'muro' }, 'es-ES')).toBe('muro');
    expect(localizedText({ en: 'wall' }, 'es')).toBe('wall');
    expect(localizedText({ en: 'wall', es: 'muro' }, 'en')).toBe('wall');
    expect(localizedText(undefined, 'en')).toBe('');
  });
});
