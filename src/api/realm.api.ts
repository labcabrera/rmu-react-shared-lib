import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateRealmDto, Realm } from './realm.dto';

export async function fetchRealm(realmId: string): Promise<Realm> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchRealms(rsql: string, page: number, size: number): Promise<Page<Realm>> {
  const url = `${apiCoreUrl}/realms?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createRealm(realm: CreateRealmDto): Promise<Realm> {
  const url = `${apiCoreUrl}/realms`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(realm),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateRealm(realmId: string, realm: Partial<Realm>): Promise<Realm> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(realm),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteRealm(realmId: string): Promise<void> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
