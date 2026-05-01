import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateEnumerationDto, Enumeration, UpdateEnumerationDto } from './enumerations.dto';

export async function fetchEnumerationCategories(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiCoreUrl}/enumeration-categories`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchEnumeration(id: string, auth: AuthContextProps): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchEnumerations(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Enumeration>> {
  const url = `${apiCoreUrl}/enumerations?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createEnumeration(dto: CreateEnumerationDto, auth: AuthContextProps): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateEnumeration(
  id: string,
  dto: UpdateEnumerationDto,
  auth: AuthContextProps
): Promise<Enumeration> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteEnumeration(id: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/enumerations/${id}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
