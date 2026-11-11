import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  cancelEnchantment,
  completeEnchantment,
  createEnchantment,
  deleteEnchantment,
  fetchAlchemyTables,
  fetchEnchantment,
  fetchEnchantments,
  progressEnchantment,
  quoteEnchantment,
  resumeEnchantment,
  sendEnchantmentFailureRolls,
  suspendEnchantment,
  updateEnchantment,
} from './enchantment.api';
import { enchantmentTotalDays, isEnchantmentActive } from './enchantment.dto';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;
const request = { alchemistId: 'c1', itemId: 'i1', spells: [{ spellId: 's1' }] };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('enchantment api (spec 064)', () => {
  it.each([
    ['fetches the alchemy tables', () => fetchAlchemyTables(auth), /\/alchemy-tables$/, 'GET', undefined],
    ['quotes', () => quoteEnchantment(request, auth), /\/enchantments\/quote$/, 'POST', request],
    [
      'starts a project',
      () => createEnchantment({ ...request, scrRolls: { s1: 50 } }, auth),
      /\/enchantments$/,
      'POST',
      { ...request, scrRolls: { s1: 50 } },
    ],
    [
      'lists projects',
      () => fetchEnchantments('gameId==g1', 0, 20, auth),
      /\/enchantments\?q=gameId%3D%3Dg1&page=0&size=20$/,
      'GET',
      undefined,
    ],
    ['fetches a project', () => fetchEnchantment('p1', auth), /\/enchantments\/p1$/, 'GET', undefined],
    [
      'sends the failure rolls',
      () => sendEnchantmentFailureRolls('p1', { s1: 40 }, auth),
      /\/enchantments\/p1\/failure-rolls$/,
      'POST',
      { rolls: { s1: 40 } },
    ],
    ['progresses', () => progressEnchantment('p1', 3, auth), /\/enchantments\/p1\/progress$/, 'POST', { days: 3 }],
    ['suspends', () => suspendEnchantment('p1', auth), /\/enchantments\/p1\/suspend$/, 'POST', undefined],
    ['resumes', () => resumeEnchantment('p1', auth), /\/enchantments\/p1\/resume$/, 'POST', undefined],
    [
      'adjusts',
      () => updateEnchantment('p1', { extraDays: 2, version: 3 }, auth),
      /\/enchantments\/p1$/,
      'PATCH',
      { extraDays: 2, version: 3 },
    ],
    ['completes', () => completeEnchantment('p1', auth), /\/enchantments\/p1\/complete$/, 'POST', undefined],
    ['cancels', () => cancelEnchantment('p1', auth), /\/enchantments\/p1\/cancel$/, 'POST', undefined],
  ])('%s', async (_, call, url, method, body) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(call()).resolves.toEqual({ ok: true });
    expect(String(fetchMock.mock.calls[0][0])).toMatch(url);
    expect(fetchMock.mock.calls[0][1].method).toBe(method);
    const sent = fetchMock.mock.calls[0][1].body;
    expect(sent === undefined ? undefined : JSON.parse(sent)).toEqual(body);
  });

  it('deletes a project (204)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(deleteEnchantment('p1', auth)).resolves.toBeNull();
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/enchantments\/p1$/);
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });
});

describe('enchantment helpers', () => {
  it('adds the extra days to the working days', () => {
    expect(enchantmentTotalDays({ plan: { workingDays: 9 } as never, extraDays: 2 })).toBe(11);
  });

  it('knows the open statuses', () => {
    expect(isEnchantmentActive('pending-failures')).toBe(true);
    expect(isEnchantmentActive('suspended')).toBe(true);
    expect(isEnchantmentActive('completed')).toBe(false);
    expect(isEnchantmentActive('cancelled')).toBe(false);
  });
});
