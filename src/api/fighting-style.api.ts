import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiStrategicGameUrl } from '../config/config.service';
import callApi from './api';
import { Character } from './character.dto';
import { FightingStyles } from './fighting-style.dto';

export async function fetchFightingStyles(auth: AuthContextProps): Promise<FightingStyles> {
  const url = `${apiCoreUrl}/fighting-styles`;
  return callApi(auth, url, { method: 'GET' });
}

/** Allocates ranks of a style skill to one of its abilities (spec 032). */
export async function addStyleAbility(
  characterId: string,
  skillId: string,
  specialization: string,
  abilityId: string,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/style-abilities`;
  return callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ specialization, abilityId }),
  });
}

/** Undoes the last selection of an ability: only the game master or an admin. */
export async function removeStyleAbility(
  characterId: string,
  skillId: string,
  specialization: string,
  abilityId: string,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/style-abilities/${abilityId}?specialization=${encodeURIComponent(specialization)}`;
  return callApi(auth, url, { method: 'DELETE' });
}
