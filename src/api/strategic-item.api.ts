import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { AddStrategicItemModifierDto } from './item-modifier.dto';
import { StrategicItem } from './strategic-item.dto';

export async function fetchStrategicItem(itemId: string, auth: AuthContextProps): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${itemId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchStrategicItems(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<StrategicItem>> {
  const url = `${apiStrategicGameUrl}/items?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createStrategicItem(dto: Partial<StrategicItem>, auth: AuthContextProps): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateStrategicItem(
  gameId: string,
  dto: Partial<StrategicItem>,
  auth: AuthContextProps
): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${gameId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteStrategicItem(gameId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiStrategicGameUrl}/items/${gameId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

/** Adds a modifier by hand (spec 019): a quality or magic bonus, or breakage damage. */
export async function addStrategicItemModifier(
  itemId: string,
  dto: AddStrategicItemModifierDto,
  auth: AuthContextProps
): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${itemId}/modifiers`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

/** Removes a modifier: a repair by hand, or a modifier no longer wanted. */
export async function deleteStrategicItemModifier(
  itemId: string,
  modifierId: string,
  auth: AuthContextProps
): Promise<StrategicItem> {
  const url = `${apiStrategicGameUrl}/items/${itemId}/modifiers/${modifierId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
