import { AuthContextProps } from 'react-oidc-context';
import { apiSpellsUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateSpellListDto, SpellList, UpdateSpellListDto } from './spell-list.dto';

export async function fetchSpellList(id: string, auth: AuthContextProps): Promise<SpellList> {
  const url = `${apiSpellsUrl}/spell-lists/${id}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchSpellLists(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<SpellList>> {
  const url = `${apiSpellsUrl}/spell-lists?q=${rsql}&page=${page}&size=${size}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function createSpellList(dto: CreateSpellListDto, auth: AuthContextProps): Promise<SpellList> {
  const url = `${apiSpellsUrl}/spell-lists`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateSpellList(
  spellListId: string,
  dto: Partial<UpdateSpellListDto>,
  auth: AuthContextProps
): Promise<SpellList> {
  const url = `${apiSpellsUrl}/spell-lists/${spellListId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteSpellList(spellListId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiSpellsUrl}/spell-lists/${spellListId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
