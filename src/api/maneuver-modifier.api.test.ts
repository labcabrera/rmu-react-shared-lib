import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchManeuverModifiers, fetchManeuverModifiersByCategory } from './maneuver-modifier.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('maneuver modifier api', () => {
  it('fetches the modifiers that apply to a skill', async () => {
    const modifiers = [{ id: '1', key: 'sample', scope: { skillIds: ['a b'] }, type: 'flag', value: 10 }];
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(modifiers));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchManeuverModifiers('a b', auth)).resolves.toEqual(modifiers);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/maneuver-modifiers\?skillId=a%20b$/);
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('GET');
  });

  it('fetches the modifiers of a skill category', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse([]));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchManeuverModifiersByCategory('cat', auth)).resolves.toEqual([]);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/maneuver-modifiers\?categoryId=cat$/);
  });
});
