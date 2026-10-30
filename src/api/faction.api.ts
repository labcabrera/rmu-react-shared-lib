import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateFactionDto, Faction, FactionNpcInput, UpdateFactionDto } from './faction.dto';

export async function fetchFaction(factionId: string, auth: AuthContextProps): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchFactions(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Faction>> {
  const url = `${apiStrategicGameUrl}/factions?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createFaction(data: CreateFactionDto, auth: AuthContextProps): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateFaction(
  factionId: string,
  data: UpdateFactionDto,
  auth: AuthContextProps
): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Replaces the NPCs of a faction (spec 055); the API checks each NPC's realm and access (400 `validation`). */
export async function updateFactionNpcs(
  factionId: string,
  npcs: FactionNpcInput[],
  auth: AuthContextProps
): Promise<Faction> {
  return updateFaction(factionId, { npcs }, auth);
}

export async function deleteFaction(factionId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addFactionGold(factionId: string, amount: number, auth: AuthContextProps): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}/add-gold`;
  const body = { gold: amount };
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
