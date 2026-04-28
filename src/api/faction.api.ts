import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateFactionDto, Faction, UpdateFactionDto } from './faction.dto';

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

export async function deleteFaction(factionId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addFactionXP(factionId: string, amount: number, auth: AuthContextProps): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}/add-xp`;
  const body = { xp: amount };
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
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
