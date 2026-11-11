import type { AuthContextProps } from 'react-oidc-context';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../data/api-error';
import { callApi } from './api';

const URL = '/api/core/v1/races';

const authWith = (signinSilent?: () => Promise<unknown>): AuthContextProps =>
  ({
    isAuthenticated: true,
    user: { access_token: 'old-token' },
    signinSilent,
  }) as unknown as AuthContextProps;

const jsonResponse = (status: number, body: unknown = {}) =>
  new Response(status === 204 ? null : JSON.stringify(body), { status, statusText: `status ${status}` });

const authHeader = (call: unknown[]): string | null =>
  new Headers((call[1] as RequestInit).headers).get('Authorization');

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('callApi', () => {
  it('sends the access token and returns the JSON body', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { id: 'a' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(callApi(authWith(), URL)).resolves.toEqual({ id: 'a' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(authHeader(fetchMock.mock.calls[0])).toBe('Bearer old-token');
  });

  it('on a 401 renews the session once and retries with the new token', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(401))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'b' }));
    vi.stubGlobal('fetch', fetchMock);
    const signinSilent = vi.fn().mockResolvedValue({ access_token: 'new-token' });

    await expect(callApi(authWith(signinSilent), URL, { method: 'GET' })).resolves.toEqual({ id: 'b' });
    expect(signinSilent).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(authHeader(fetchMock.mock.calls[1])).toBe('Bearer new-token');
  });

  it('throws the usual error when the retry also gets a 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401));
    vi.stubGlobal('fetch', fetchMock);
    const signinSilent = vi.fn().mockResolvedValue({ access_token: 'new-token' });

    const error = await callApi(authWith(signinSilent), URL).catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).status).toBe(401);
    expect(signinSilent).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('throws the 401 without retrying when the silent sign-in fails', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401));
    vi.stubGlobal('fetch', fetchMock);
    const signinSilent = vi.fn().mockRejectedValue(new Error('login_required'));

    await expect(callApi(authWith(signinSilent), URL)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws the 401 without retrying when there is no signinSilent', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(401));
    vi.stubGlobal('fetch', fetchMock);

    await expect(callApi(authWith(), URL)).rejects.toMatchObject({ status: 401 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not renew the session on other errors', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(403));
    vi.stubGlobal('fetch', fetchMock);
    const signinSilent = vi.fn();

    await expect(callApi(authWith(signinSilent), URL)).rejects.toMatchObject({ status: 403 });
    expect(signinSilent).not.toHaveBeenCalled();
  });

  it('returns null for a 204', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(204)));
    await expect(callApi(authWith(), URL, { method: 'DELETE' })).resolves.toBeNull();
  });
});
