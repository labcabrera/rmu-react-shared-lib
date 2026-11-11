import { AuthContextProps } from 'react-oidc-context';
import { apiNpcUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateNpcDto, Npc, UpdateNpcDto } from './npc.dto';

export async function fetchNpc(NpcId: string, auth: AuthContextProps): Promise<Npc> {
  const url = `${apiNpcUrl}/npcs/${NpcId}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** NPCs filtered by RSQL; `size` up to 1000 to load the whole catalog. */
export async function fetchNpcs(rsql: string, page: number, size: number, auth: AuthContextProps): Promise<Page<Npc>> {
  const url = `${apiNpcUrl}/npcs?q=${encodeURIComponent(rsql)}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createNpc(Npc: CreateNpcDto, auth: AuthContextProps): Promise<Npc> {
  const url = `${apiNpcUrl}/npcs`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Npc),
  });
}

/** A partial change; lists (attacks, skills, movement…) replace the stored ones whole. Send `version` for a 409. */
export async function updateNpc(NpcId: string, dto: UpdateNpcDto, auth: AuthContextProps): Promise<Npc> {
  const url = `${apiNpcUrl}/npcs/${NpcId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteNpc(npcId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiNpcUrl}/npcs/${npcId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
