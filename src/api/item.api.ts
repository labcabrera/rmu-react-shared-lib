import { AuthContextProps } from 'react-oidc-context';
import { apiItemsUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateItemDto, Item, ItemModifierOption, UpdateItemDto } from './item.dto';

export async function fetchItem(itemId: string, auth: AuthContextProps): Promise<Item> {
  const url = `${apiItemsUrl}/items/${itemId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchItems(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Item>> {
  const url = `${apiItemsUrl}/items?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createItem(item: CreateItemDto, auth: AuthContextProps): Promise<Item> {
  const url = `${apiItemsUrl}/items`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export async function updateItem(itemId: string, dto: UpdateItemDto, auth: AuthContextProps): Promise<Item> {
  const url = `${apiItemsUrl}/items/${itemId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteItem(itemId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiItemsUrl}/items/${itemId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function fetchItemModifierOptions(auth: AuthContextProps): Promise<ItemModifierOption[]> {
  const url = `${apiItemsUrl}/item-modifiers/options`;
  return await callApi(auth, url, { method: 'GET' });
}
