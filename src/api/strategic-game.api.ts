import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiStrategicGameUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateStrategicGameDto, StrategicGame, UpdateStrategicGameDto } from './strategic-game.dto';

export async function fetchStrategicGames(rsql: string, page: number, size: number): Promise<Page<StrategicGame>> {
  const url = `${apiStrategicGameUrl}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchStrategicGame(gameId: string): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function createStrategicGame(gameData: CreateStrategicGameDto): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(gameData),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function updateStrategicGame(gameId: string, gameData: UpdateStrategicGameDto): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(gameData),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return (await response.json()) as StrategicGame;
}

export async function deleteStrategicGame(gameId: string): Promise<void> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
