import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { levelUpCharacter, levelUpSkill } from './character.api';
import { isIntenseTrainingSkill } from './character.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const mockFetch = () => {
  const fetchMock = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ id: 'c1' }), { status: 200 }));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const call = (fetchMock: ReturnType<typeof vi.fn>) => {
  const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
  return { url: String(url), method: init.method };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('character development api (spec 076)', () => {
  it('levels up a skill with the auto pool by default', async () => {
    const fetchMock = mockFetch();
    await levelUpSkill('c1', 'riding', 'horse', auth);
    expect(call(fetchMock)).toMatchObject({
      method: 'PATCH',
      url: expect.stringMatching(/\/characters\/c1\/skills\/riding\/level-up\?specialization=horse$/),
    });
  });

  it('sends the chosen pool', async () => {
    const fetchMock = mockFetch();
    await levelUpSkill('c1', 'riding', undefined, auth, 'bonus');
    expect(call(fetchMock).url).toMatch(/\/skills\/riding\/level-up\?pool=bonus$/);
  });

  it('saves the unspent points on level up only when asked', async () => {
    const fetchMock = mockFetch();
    await levelUpCharacter('c1', false, auth, true);
    await levelUpCharacter('c1', true, auth);
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/level-up\?force=false&save=true$/);
    expect(String(fetchMock.mock.calls[1][0])).toMatch(/\/level-up\?force=true$/);
  });

  it('tells the skill trained intensely', () => {
    const experience = { intenseTrainingSkill: { skillId: 'riding', specialization: 'horse' } };
    expect(isIntenseTrainingSkill(experience, { skillId: 'riding', specialization: 'horse' })).toBe(true);
    expect(isIntenseTrainingSkill(experience, { skillId: 'riding', specialization: 'camel' })).toBe(false);
    expect(
      isIntenseTrainingSkill({ intenseTrainingSkill: { skillId: 'jump', specialization: null } }, { skillId: 'jump' })
    ).toBe(true);
    expect(isIntenseTrainingSkill({ intenseTrainingSkill: null }, { skillId: 'jump' })).toBe(false);
  });
});
