import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { Page } from './common.dto';
import { CreateProfessionDto, Profession, UpdateProfessionDto } from './profession.dto';

export async function fetchProfession(professionId: string, auth: AuthContextProps): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchProfessions(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Profession>> {
  const url = `${apiCoreUrl}/professions?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createProfession(dto: CreateProfessionDto, auth: AuthContextProps): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateProfession(
  professionId: string,
  profession: UpdateProfessionDto,
  auth: AuthContextProps
): Promise<Profession> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profession),
  });
}

export async function deleteProfession(professionId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/professions/${professionId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
