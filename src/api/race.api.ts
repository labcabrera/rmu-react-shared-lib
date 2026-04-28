import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { Page } from './common.dto';
import { AddRaceTraitDto, CreateRaceDto, Race, RaceSkillBonus, UpdateRaceDto } from './race.dto';

export async function fetchRace(raceId: string, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchRaces(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Race>> {
  const url = `${apiCoreUrl}/races?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createRace(data: CreateRaceDto, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateRace(raceId: string, data: UpdateRaceDto, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteRace(raceId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/races/${raceId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addRaceTrait(raceId: string, dto: AddRaceTraitDto, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/traits`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteRaceTrait(raceId: string, traitId: string, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/traits/${traitId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addRaceSkillBonus(raceId: string, dto: RaceSkillBonus, auth: AuthContextProps): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/skill-bonuses`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteRaceSkillBonus(
  raceId: string,
  skillId: string,
  specialization: string | null,
  auth: AuthContextProps
): Promise<Race> {
  const url = `${apiCoreUrl}/races/${raceId}/skill-bonuses/${skillId}${specialization ? `?specialization=${encodeURIComponent(specialization)}` : ''}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
