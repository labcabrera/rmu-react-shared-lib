import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { magicBonusValue } from './magic-item.dto';
import {
  awardTreasure,
  changeCharges,
  createMagicItem,
  cutGem,
  fetchTreasureTables,
  quoteMagicItem,
  rechargeItem,
  rollTreasure,
  setGem,
  unsetGem,
} from './treasure.api';
import { isAwardableTreasureLine } from './treasure.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;
const request = {
  baseItemTypeId: 'sword',
  kind: 'weapon' as const,
  bonuses: [{ kind: 'ob' as const, value: 10 }],
  spells: [],
};
const holder = { kind: 'faction' as const, id: 'f1' };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('treasure and magic item api (spec 067)', () => {
  it.each([
    ['fetches the treasure tables', () => fetchTreasureTables(auth), /\/treasure-tables$/, 'GET', undefined],
    [
      'rolls a treasure',
      () => rollTreasure({ codes: 'c, n, x', wealthModifier: 5 }, auth),
      /\/treasure\/rolls$/,
      'POST',
      { codes: 'c, n, x', wealthModifier: 5 },
    ],
    [
      'awards the lines',
      () => awardTreasure({ gameId: 'g1', holder, lines: [{ kind: 'gold', gold: 3, dice: [] }] }, auth),
      /\/treasure\/awards$/,
      'POST',
      { gameId: 'g1', holder, lines: [{ kind: 'gold', gold: 3, dice: [] }] },
    ],
    ['quotes a magic item', () => quoteMagicItem(request, auth), /\/items\/magic\/quote$/, 'POST', request],
    [
      'creates a magic item',
      () => createMagicItem({ ...request, gameId: 'g1', factionId: 'f1', payer: 'none' }, auth),
      /\/items\/magic$/,
      'POST',
      { ...request, gameId: 'g1', factionId: 'f1', payer: 'none' },
    ],
    ['spends charges', () => changeCharges('i1', { delta: -1 }, auth), /\/items\/i1\/charges$/, 'POST', { delta: -1 }],
    ['recharges', () => rechargeItem('i1', auth), /\/items\/i1\/charges$/, 'POST', { recharge: true }],
    ['cuts a gem', () => cutGem('i1', 5, auth), /\/items\/i1\/cut$/, 'POST', { cutFactor: 5 }],
    ['sets a gem', () => setGem('i1', 'g2', auth), /\/items\/i1\/settings$/, 'POST', { gemItemId: 'g2' }],
    ['unsets a gem', () => unsetGem('i1', 0, auth), /\/items\/i1\/settings\/0$/, 'DELETE', undefined],
  ])('%s', async (_, call, url, method, body) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(call()).resolves.toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(url);
    expect(fetchMock.mock.calls[0][1].method).toBe(method);
    const sent = fetchMock.mock.calls[0][1].body;
    expect(sent === undefined ? undefined : JSON.parse(sent)).toEqual(body);
  });
});

describe('treasure helpers', () => {
  it('awards gold and items, not notes', () => {
    expect(isAwardableTreasureLine({ kind: 'gold', gold: 1, dice: [] })).toBe(true);
    expect(isAwardableTreasureLine({ kind: 'note', text: 'x', dice: [] })).toBe(false);
  });

  it('signs the bonus values', () => {
    expect(magicBonusValue({ kind: 'ob', value: 10 })).toBe('+10');
    expect(magicBonusValue({ kind: 'armor-penalty', value: -5 })).toBe('-5');
    expect(magicBonusValue({ kind: 'pp-multiplier', value: 2 })).toBe('×2');
  });
});
