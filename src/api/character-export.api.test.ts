import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { exportCharacter, fileNameFromDisposition, importCharacter, importFaction } from './character-export.api';

const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('fileNameFromDisposition', () => {
  it('reads a quoted, a bare and an encoded file name', () => {
    expect(fileNameFromDisposition('attachment; filename="character-aragorn-20261025.rmu.json"', 'x')).toBe(
      'character-aragorn-20261025.rmu.json'
    );
    expect(fileNameFromDisposition('attachment; filename=faction.rmu.json', 'x')).toBe('faction.rmu.json');
    expect(fileNameFromDisposition('attachment; filename="a.json"; filename*=UTF-8\'\'%C3%B1and%C3%BA.json', 'x')).toBe(
      'ñandú.json'
    );
  });

  it('falls back when there is no header or no file name', () => {
    expect(fileNameFromDisposition(null, 'fallback.json')).toBe('fallback.json');
    expect(fileNameFromDisposition('attachment', 'fallback.json')).toBe('fallback.json');
  });
});

describe('export and import calls', () => {
  it('downloads the export with the name of the header', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('{"format":"rmu-strategic-export"}', {
        status: 200,
        headers: { 'Content-Disposition': 'attachment; filename="character-a-20261025.rmu.json"' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await exportCharacter('c-1', auth);
    expect(result.fileName).toBe('character-a-20261025.rmu.json');
    expect(await result.blob.text()).toBe('{"format":"rmu-strategic-export"}');
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/characters\/c-1\/export$/);
  });

  it('posts a character import with dryRun, characterRef and an ASCII file name', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"errors":[]}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await importCharacter('f-1', { a: 1 }, { dryRun: true, characterRef: 'c2', fileName: 'ñu.rmu.json' }, auth);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/factions\/f-1\/character-imports\?dryRun=true&characterRef=c2$/);
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"a":1}');
    expect(new Headers(init.headers).get('X-RMU-File-Name')).toBe('_u.rmu.json');
  });

  it('posts a faction import to the strategic game', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"importId":"i"}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(importFaction('g-1', '{"a":1}', {}, auth)).resolves.toEqual({ importId: 'i' });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/strategic-games\/g-1\/faction-imports$/);
    expect(init.body).toBe('{"a":1}');
  });
});
