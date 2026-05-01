import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateTraitDto, Trait, UpdateTraitDto } from './trait.dto';

export async function fetchTrait(traitId: string, auth: AuthContextProps): Promise<Trait> {
  const url = `${apiCoreUrl}/traits/${traitId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchTraits(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Trait>> {
  const url = `${apiCoreUrl}/traits?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createTrait(trait: CreateTraitDto, auth: AuthContextProps): Promise<Trait> {
  const url = `${apiCoreUrl}/traits`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trait),
  });
}

export async function updateTrait(traitId: string, dto: UpdateTraitDto, auth: AuthContextProps): Promise<Trait> {
  const url = `${apiCoreUrl}/traits/${traitId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteTrait(realmId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/traits/${realmId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
