import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateCultureDto, Culture, CultureSkillRank, UpdateCultureDto } from './culture.dto';

export async function fetchCulture(cultureId: string, auth: AuthContextProps): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchCultures(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Culture>> {
  const url = `${apiCoreUrl}/cultures?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createCulture(data: CreateCultureDto, auth: AuthContextProps): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateCulture(
  cultureId: string,
  data: UpdateCultureDto,
  auth: AuthContextProps
): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCulture(cultureId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/cultures/${cultureId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function addCultureFixedSkillRank(
  cultureId: string,
  data: CultureSkillRank,
  auth: AuthContextProps
): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}/fixed-skills`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCultureFixedSkillRank(
  cultureId: string,
  skillId: string,
  specialization: string | null,
  auth: AuthContextProps
): Promise<Culture> {
  const dto = { skillId, specialization };
  const url = `${apiCoreUrl}/cultures/${cultureId}/fixed-skills`;
  return await callApi(auth, url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}
