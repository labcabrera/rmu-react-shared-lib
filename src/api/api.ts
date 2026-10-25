import { type AuthContextProps } from 'react-oidc-context';
import { ApiError } from '../data/api-error';

export interface Pagination {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface Page<T> {
  content: T[];
  pagination: Pagination;
}

async function send(url: string, init: RequestInit, token: string): Promise<Response> {
  const headers = new Headers(init.headers as HeadersInit);
  headers.set('Authorization', `Bearer ${token}`);
  try {
    return await fetch(url, { ...init, headers });
  } catch (err) {
    throw new ApiError(0, 'Network error', String(err), url);
  }
}

/**
 * Renews the session once with a silent sign-in (refresh token, or prompt=none against the
 * Keycloak session) and returns the new access token, or undefined when it cannot be renewed.
 */
async function renewToken(auth: AuthContextProps): Promise<string | undefined> {
  if (typeof auth.signinSilent !== 'function') return undefined;
  try {
    const user = await auth.signinSilent();
    return user?.access_token || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Sends a request to an RMU API with the user's access token and returns the raw Response, for the
 * callers that need its headers or body as a Blob. On a 401 it tries one silent sign-in and retries
 * the request once with the new token; a failed response throws the usual ApiError.
 */
export async function callApiResponse(auth: AuthContextProps, url: string, init: RequestInit = {}): Promise<Response> {
  if (!auth) throw new Error(`Auth instance is required. Url: ${url}`);
  if (!auth.isAuthenticated) throw new Error('Not authenticated');
  const token = auth.user?.access_token;
  if (!token) throw new Error(`No access token available. Url: ${url}`);

  let res = await send(url, init, token);
  if (res.status === 401) {
    const renewedToken = await renewToken(auth);
    if (renewedToken) {
      res = await send(url, init, renewedToken);
    }
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, res.statusText, text, url);
  }
  return res;
}

/** Calls an RMU API (see callApiResponse) and returns the JSON body, or null for a 204. */
export async function callApi(auth: AuthContextProps, url: string, init: RequestInit = {}) {
  const res = await callApiResponse(auth, url, init);
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

export default callApi;
