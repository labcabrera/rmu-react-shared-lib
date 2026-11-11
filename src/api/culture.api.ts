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

/** Appends one typed entry to the culture's skill ranks. */
export async function addCultureSkillRank(
  cultureId: string,
  data: CultureSkillRank,
  auth: AuthContextProps
): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}/skill-ranks`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Removes the skill rank entry at the given 0-based index. */
export async function deleteCultureSkillRank(
  cultureId: string,
  index: number,
  auth: AuthContextProps
): Promise<Culture> {
  const url = `${apiCoreUrl}/cultures/${cultureId}/skill-ranks/${index}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
