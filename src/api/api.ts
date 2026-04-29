import { type AuthContextProps } from 'react-oidc-context';

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

export async function callApi(auth: AuthContextProps, url: string, init: RequestInit = {}) {
  if (!auth) throw new Error(`Auth instance is required. Url: ${url}`);
  if (!auth.isAuthenticated) throw new Error('Not authenticated');
  const token = auth.user?.access_token;
  if (!token) throw new Error(`No access token available. Url: ${url}`);

  const headers = new Headers(init.headers as HeadersInit);
  headers.set('Authorization', `Bearer ${token}`);
  init.headers = headers;

  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API request failed: ${res.status} ${res.statusText} ${text}. Url: ${url}`);
  }
  if (res.status === 204) {
    return null;
  }
  return res.json();
}

export default callApi;
