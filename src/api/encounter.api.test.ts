import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchEncounterSettings, fetchEncounterTable, fetchEncounterTables, resolveEncounter } from './encounter.api';
import { rollEncounterDice } from './encounter.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('encounter api (spec 061)', () => {
  it.each([
    ['lists the tables', () => fetchEncounterTables(auth), /\/encounter-tables$/, 'GET'],
    ['fetches a table', () => fetchEncounterTable('a b', auth), /\/encounter-tables\/a%20b$/, 'GET'],
    ['fetches the settings', () => fetchEncounterSettings(auth), /\/encounter-settings$/, 'GET'],
    [
      'resolves an encounter',
      () => resolveEncounter({ tableId: 'prairie', water: false, land: true, rolls: [12] }, auth),
      /\/encounters\/resolve$/,
      'POST',
    ],
  ])('%s', async (_, call, url, method) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(call()).resolves.toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(url);
    expect(fetchMock.mock.calls[0][1].method).toBe(method);
  });

  it('sends the request as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await resolveEncounter({ tableId: 'ocean', water: true, land: false, rolls: [], creatureModifier: 5 }, auth);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      tableId: 'ocean',
      water: true,
      land: false,
      rolls: [],
      creatureModifier: 5,
    });
  });
});

describe('rollEncounterDice', () => {
  const max = (sides: number) => sides;
  it('rolls dice expressions', () => {
    expect(rollEncounterDice('1d2', max)).toBe(2);
    expect(rollEncounterDice('2D10+1', max)).toBe(21);
    expect(rollEncounterDice('3d4-20', max)).toBe(1);
    expect(rollEncounterDice('5', max)).toBe(5);
  });
  it('gives up on what it cannot read', () => {
    expect(rollEncounterDice(null)).toBeUndefined();
    expect(rollEncounterDice('')).toBeUndefined();
    expect(rollEncounterDice('many')).toBeUndefined();
  });
});
