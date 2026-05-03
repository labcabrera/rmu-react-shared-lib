import { AuthContextProps } from 'react-oidc-context';
import { apiSpellsUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateSpellDto, Spell, UpdateSpellDto } from './spell.dto';

export async function fetchSpell(id: string, auth: AuthContextProps): Promise<Spell> {
  const url = `${apiSpellsUrl}/spells/${id}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchSpells(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Spell>> {
  const url = `${apiSpellsUrl}/spells?q=${rsql}&page=${page}&size=${size}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function createSpell(dto: CreateSpellDto, auth: AuthContextProps): Promise<Spell> {
  const url = `${apiSpellsUrl}/spells`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateSpell(
  spellId: string,
  dto: Partial<UpdateSpellDto>,
  auth: AuthContextProps
): Promise<Spell> {
  const url = `${apiSpellsUrl}/spells/${spellId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteSpell(spellId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiSpellsUrl}/spells/${spellId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function fetchSpellTargetTypes(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiSpellsUrl}/target-types`;
  return await callApi(auth, url, { method: 'GET' });
}
