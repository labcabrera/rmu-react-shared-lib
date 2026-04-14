import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateTraitDto, Trait, UpdateTraitDto } from './trait.dto';

export async function fetchTrait(traitId: string): Promise<Trait> {
  const url = `${apiCoreUrl}/traits/${traitId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchTraits(rsql: string, page: number, size: number): Promise<Page<Trait>> {
  const url = `${apiCoreUrl}/traits?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createTrait(trait: CreateTraitDto): Promise<Trait> {
  const url = `${apiCoreUrl}/traits`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(trait),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateTrait(traitId: string, dto: UpdateTraitDto): Promise<Trait> {
  const url = `${apiCoreUrl}/traits/${traitId}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteTrait(realmId: string): Promise<void> {
  const url = `${apiCoreUrl}/traits/${realmId}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
