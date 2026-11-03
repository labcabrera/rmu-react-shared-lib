import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import {
  CreateStrategicGameDto,
  GameMemberRole,
  GameMembers,
  GameTimeLogEntry,
  PassTimeRequest,
  PassTimeResult,
  StrategicGame,
  UpdateStrategicGameDto,
} from './strategic-game.dto';

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

/** Time passes in the campaign (spec 065): the calendar and the rest of its characters, or a preview with `dryRun`. */
export async function passTime(gameId: string, body: PassTimeRequest, auth: AuthContextProps): Promise<PassTimeResult> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/pass-time`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Time log of the campaign, newest first (spec 065). */
export async function fetchGameTimeLog(
  gameId: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<GameTimeLogEntry>> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/time-log?page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** Members of the game, and its join requests for the masters (spec 071). */
export async function fetchGameMembers(gameId: string, auth: AuthContextProps): Promise<GameMembers> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/members`;
  return await callApi(auth, url, { method: 'GET' });
}

/** Adds a friend of the owner to the game, or changes their role (spec 071). */
export async function setGameMember(
  gameId: string,
  userId: string,
  role: GameMemberRole,
  auth: AuthContextProps
): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/members/${encodeURIComponent(userId)}`;
  return await callApi(auth, url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
}

/** Expels a member, or leaves the game with `me` (spec 071). */
export async function removeGameMember(gameId: string, userId: string, auth: AuthContextProps): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/members/${encodeURIComponent(userId)}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

/** Asks to join a public game (spec 071). */
export async function requestJoinGame(
  gameId: string,
  message: string | undefined,
  auth: AuthContextProps
): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/join-requests`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message ? { message } : {}),
  });
}

/** A master approves a join request: the user joins as a player (spec 071). */
export async function approveJoinRequest(gameId: string, userId: string, auth: AuthContextProps): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/join-requests/${encodeURIComponent(userId)}/approve`;
  return await callApi(auth, url, { method: 'POST' });
}

/** A master rejects a join request, or the user takes back their own with `me` (spec 071). */
export async function removeJoinRequest(gameId: string, userId: string, auth: AuthContextProps): Promise<StrategicGame> {
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/join-requests/${encodeURIComponent(userId)}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
