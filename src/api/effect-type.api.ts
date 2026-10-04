import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateEffectTypeDto, EffectType, UpdateEffectTypeDto } from './effect-type.dto';

export async function fetchEffectType(effectTypeId: string, auth: AuthContextProps): Promise<EffectType> {
  const url = `${apiCoreUrl}/effect-types/${effectTypeId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchEffectTypes(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<EffectType>> {
  const url = `${apiCoreUrl}/effect-types?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createEffectType(dto: CreateEffectTypeDto, auth: AuthContextProps): Promise<EffectType> {
  const url = `${apiCoreUrl}/effect-types`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateEffectType(
  effectTypeId: string,
  dto: UpdateEffectTypeDto,
  auth: AuthContextProps
): Promise<EffectType> {
  const url = `${apiCoreUrl}/effect-types/${effectTypeId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteEffectType(effectTypeId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/effect-types/${effectTypeId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
