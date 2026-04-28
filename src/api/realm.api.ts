import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateRealmDto, Realm } from './realm.dto';

export async function fetchRealm(realmId: string, auth: AuthContextProps): Promise<Realm> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchRealms(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Realm>> {
  const url = `${apiCoreUrl}/realms?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createRealm(realm: CreateRealmDto, auth: AuthContextProps): Promise<Realm> {
  const url = `${apiCoreUrl}/realms`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(realm),
  });
}

export async function updateRealm(realmId: string, realm: Partial<Realm>, auth: AuthContextProps): Promise<Realm> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(realm),
  });
}

export async function deleteRealm(realmId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
