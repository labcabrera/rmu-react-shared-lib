import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  fetchAttackTable,
  fetchCriticalTable,
  fetchCriticalTypes,
  fetchFumbleTable,
  lookupAttackTable,
} from './attack-table.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

const jsonResponse = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('attack table api (spec 036)', () => {
  it.each([
    ['looks up a roll', () => lookupAttackTable('broadsword', 5, 120, auth), /\/attack-tables\/broadsword\/5\/120$/],
    ['fetches a whole attack table', () => fetchAttackTable('cold ball', auth), /\/attack-tables\/cold%20ball$/],
    ['lists the critical types', () => fetchCriticalTypes(auth), /\/critical-tables$/],
    ['fetches every severity of a critical type', () => fetchCriticalTable('P', auth), /\/critical-tables\/P$/],
    ['fetches a whole fumble table', () => fetchFumbleTable('bows', auth), /\/fumble-tables\/bows$/],
  ])('%s', async (_, call, url) => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(call()).resolves.toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(url);
    expect((fetchMock.mock.calls[0][1] as RequestInit).method).toBe('GET');
  });
});
