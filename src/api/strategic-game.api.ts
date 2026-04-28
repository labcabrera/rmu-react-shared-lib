import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateStrategicGameDto, StrategicGame, UpdateStrategicGameDto } from './strategic-game.dto';

export async function fetchStrategicGames(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<StrategicGame>> {
  const url = `${apiStrategicGameUrl}/strategic-games?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchStrategicGame(gameId: string, auth: AuthContextProps): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createStrategicGame(
  gameData: CreateStrategicGameDto,
  auth: AuthContextProps
): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
}

export async function updateStrategicGame(
  gameId: string,
  gameData: UpdateStrategicGameDto,
  auth: AuthContextProps
): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(gameData),
  });
}

export async function deleteStrategicGame(gameId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
