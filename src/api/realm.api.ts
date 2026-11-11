import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { EntityShare, ShareLevel } from './common.dto';
import { CreateRealmDto, Realm, RealmScope } from './realm.dto';

export async function fetchRealm(realmId: string, auth: AuthContextProps): Promise<Realm> {
  const url = `${apiCoreUrl}/realms/${realmId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchRealms(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps,
  /** Only the user's realms, the ones shared with the user, or the public ones (spec 069). */
  scope?: RealmScope
): Promise<Page<Realm>> {
  const scopeParam = scope ? `&scope=${scope}` : '';
  const url = `${apiCoreUrl}/realms?q=${rsql}&page=${page}&size=${size}${scopeParam}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** The generic realms (spec 055): their NPCs join the campaigns of any realm. */
export async function fetchGenericRealms(auth: AuthContextProps): Promise<Realm[]> {
  return (await fetchRealms('generic==true', 0, 100, auth)).content;
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

/** Who the realm is shared with (spec 069): only for who manages it. */
export async function fetchRealmShares(realmId: string, auth: AuthContextProps): Promise<EntityShare[]> {
  return await callApi(auth, `${apiCoreUrl}/realms/${realmId}/shares`, { method: 'GET' });
}

/** Gives a friend of the owner read or write access to the realm, or changes the level (spec 069). */
export async function shareRealm(realmId: string, userId: string, level: ShareLevel, auth: AuthContextProps): Promise<Realm> {
  return await callApi(auth, `${apiCoreUrl}/realms/${realmId}/shares/${encodeURIComponent(userId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level }),
  });
}

/** Removes the access of a user; that user can also give up its own (spec 069). */
export async function unshareRealm(realmId: string, userId: string, auth: AuthContextProps): Promise<Realm> {
  return await callApi(auth, `${apiCoreUrl}/realms/${realmId}/shares/${encodeURIComponent(userId)}`, { method: 'DELETE' });
}
