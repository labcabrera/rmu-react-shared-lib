import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { AddRaceTraitDto, CreateRaceDto, Race, RaceSkillBonus, UpdateRaceDto } from './race.dto';

export async function fetchRace(raceId: string): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchRaces(rsql: string, page: number, size: number): Promise<Page<Race>> {
  const url = `${apiCoreUrl}/races?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createRace(data: CreateRaceDto): Promise<Race> {
  const url = `${apiCoreUrl}/races`;
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

export async function updateRace(raceId: string, data: UpdateRaceDto): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}`;
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

export async function deleteRace(raceId: string): Promise<void> {
  const url = `${apiCoreUrl}/races/${raceId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}

export async function addRaceTrait(raceId: string, dto: AddRaceTraitDto): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/traits`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteRaceTrait(raceId: string, traitId: string): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/traits/${traitId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addRaceSkillBonus(raceId: string, dto: RaceSkillBonus): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/skill-bonuses`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function addDeleteSkillBonus(
  raceId: string,
  skillId: string,
  specialization: string | null
): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/skill-bonuses/${skillId}${specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
