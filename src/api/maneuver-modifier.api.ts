import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { ManeuverModifier } from './maneuver-modifier.dto';

/** Modifiers that apply to a skill: the skill's own plus its category's. */
export async function fetchManeuverModifiers(skillId: string, auth: AuthContextProps): Promise<ManeuverModifier[]> {
  const url = `${apiCoreUrl}/maneuver-modifiers?skillId=${encodeURIComponent(skillId)}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** Modifiers whose scope includes a skill category. */
export async function fetchManeuverModifiersByCategory(
  categoryId: string,
  auth: AuthContextProps
): Promise<ManeuverModifier[]> {
  const url = `${apiCoreUrl}/maneuver-modifiers?categoryId=${encodeURIComponent(categoryId)}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchPagedManeuverModifiers(
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<ManeuverModifier>> {
  const url = `${apiCoreUrl}/maneuver-modifiers?page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchManeuverModifier(id: string, auth: AuthContextProps): Promise<ManeuverModifier> {
  const url = `${apiCoreUrl}/maneuver-modifiers/${id}`;
  return await callApi(auth, url, { method: 'GET' });
}
