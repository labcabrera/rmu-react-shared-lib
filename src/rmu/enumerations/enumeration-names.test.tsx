import type { AuthContextProps } from 'react-oidc-context';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as api from '../../api/enumerations.api';
import {
  enumerationName,
  loadEnumerationNames,
  resetEnumerationNames,
  specializationLabel,
  toKey,
} from './enumeration-names';

// Invented keys and names, spec 050
const page = (content: { key: string; name: string; realmId: string | null }[]) =>
  Promise.resolve({
    content,
    pagination: { page: 0, size: 1000, totalElements: content.length, totalPages: 1 },
  } as never);

describe('enumeration names', () => {
  beforeEach(() => resetEnumerationNames());

  it('labels a key with its translation, else the name of the catalog, else the key', async () => {
    vi.spyOn(api, 'fetchEnumerations').mockReturnValue(
      page([
        { key: 'north-tongue', name: 'North Tongue', realmId: null },
        { key: 'north-tongue', name: 'Northern speech', realmId: 'realm-1' },
        { key: 'horse', name: 'horse', realmId: null },
      ])
    );
    await loadEnumerationNames({} as AuthContextProps);

    const t = (key: string, options?: Record<string, unknown>) =>
      key === 'horse' ? 'Caballo' : String(options?.defaultValue ?? key);
    expect(enumerationName('north-tongue')).toBe('Northern speech');
    expect(specializationLabel(t, 'north-tongue')).toBe('Northern speech');
    expect(specializationLabel(t, 'horse')).toBe('Caballo');
    expect(specializationLabel(t, 'unknown-key')).toBe('unknown-key');
    expect(specializationLabel(t, null)).toBe('');
  });

  it('derives the key core stores from a name', () => {
    expect(toKey('Black Speech')).toBe('black-speech');
    expect(toKey(' Adûnaic ')).toBe('adunaic');
    expect(toKey('dealer/croupier')).toBe('dealer-croupier');
  });
});
