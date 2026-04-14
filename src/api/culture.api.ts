import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { CreateCultureDto, Culture, UpdateCultureDto } from './culture.dto';
import { buildErrorFromResponse } from './error-handler';

export async function fetchCulture(cultureId: string): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchCultures(rsql: string, page: number, size: number): Promise<Page<Culture>> {
  const url = `${apiCoreUrl}/cultures?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createCulture(data: CreateCultureDto): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures`;
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

export async function updateCulture(cultureId: string, data: UpdateCultureDto): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
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

export async function deleteCulture(cultureId: string): Promise<void> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
