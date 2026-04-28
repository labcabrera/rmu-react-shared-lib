import { AuthContextProps } from 'react-oidc-context';
import { apiTacticalUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateTacticalGameDto, TacticalGame, UpdateTacticalGameDto } from './tactical-game.dto';

export function getPhaseAsNumber(game: TacticalGame): number | undefined {
  if (!game) return undefined;
  const phase = game?.phase;
  if (!phase || typeof phase !== 'string') return undefined;
  const prefix = 'phase_';
  if (!phase.startsWith(prefix)) return undefined;
  const numStr = phase.slice(prefix.length);
  if (!numStr) return undefined;
  const num = Number(numStr);
  if (!Number.isFinite(num) || !Number.isInteger(num)) return undefined;
  return num;
}

export async function fetchTacticalGames(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<TacticalGame>> {
  const url = `${apiTacticalUrl}/tactical-games?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchTacticalGame(gameId: string, auth: AuthContextProps): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createTacticalGame(
  gameData: CreateTacticalGameDto,
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
}

export async function updateTacticalGame(
  gameId: string,
  gameData: UpdateTacticalGameDto,
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
}

export async function deleteTacticalGame(gameId: string, auth: AuthContextProps): Promise<boolean> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addTacticalGameFaction(
  gameId: string,
  factionId: string,
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/factions`;
  const data = { factions: [factionId] };
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteTacticalGameFaction(
  gameId: string,
  factionId: string,
  auth: AuthContextProps
): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/factions`;
  const data = { factions: [factionId] };
  return await callApi(auth, url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function addActor(
  gameId: string,
  actorId: string,
  type: string,
  auth: AuthContextProps
): Promise<TacticalGame> {
  const request = { actors: [{ id: actorId, type }] };
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/actors`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function deleteActor(gameId: string, actorId: string, auth: AuthContextProps): Promise<TacticalGame> {
  const data = { actors: [actorId] };
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/actors`;
  return await callApi(auth, url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function startRound(gameId: string, auth: AuthContextProps): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/rounds/start`;
  return await callApi(auth, url, { method: 'POST' });
}

export async function startPhase(gameId: string, auth: AuthContextProps): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/phases/start`;
  return await callApi(auth, url, { method: 'POST' });
}

export async function randomizeInitiatives(gameId: string, auth: AuthContextProps): Promise<TacticalGame> {
  const url = `${apiTacticalUrl}/tactical-games/${gameId}/initiatives/randomize`;
  return await callApi(auth, url, { method: 'POST' });
}
