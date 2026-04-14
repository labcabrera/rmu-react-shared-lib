import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiStrategicGameUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateFactionDto, Faction, UpdateFactionDto } from './faction.dto';

export async function fetchFaction(factionId: string): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchFactions(rsql: string, page: number, size: number): Promise<Page<Faction>> {
  const url = `${apiStrategicGameUrl}/factions?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createFaction(data: CreateFactionDto): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateFaction(factionId: string, data: UpdateFactionDto): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(data),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteFaction(factionId: string): Promise<void> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addFactionXP(factionId: string, amount: number): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}/add-xp`;
  const body = { xp: amount };
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addFactionGold(factionId: string, amount: number): Promise<Faction> {
  const url = `${apiStrategicGameUrl}/factions/${factionId}/add-gold`;
  const body = { gold: amount };
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: mergeJsonHeaders(),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
