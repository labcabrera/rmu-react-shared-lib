import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateProfessionDto, Profession, UpdateProfessionDto } from './profession.dto';

export async function fetchProfession(professionId: string): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchProfessions(rsql: string, page: number, size: number): Promise<Page<Profession>> {
  const url = `${apiCoreUrl}/professions?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createProfession(dto: CreateProfessionDto): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/`;
  const response = await fetch(url, { method: 'POST', headers: mergeJsonHeaders(), body: JSON.stringify(dto) });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateProfession(professionId: string, profession: UpdateProfessionDto): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  const response = await fetch(url, { method: 'PATCH', headers: mergeJsonHeaders(), body: JSON.stringify(profession) });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteProfession(professionId: string): Promise<void> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
  return;
}
