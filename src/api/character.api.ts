import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from './../config/config.service';
import callApi, { Page } from './api';
import { AddTraitDto, Character, KnownSpellList, UpdateTemporaryStatDto } from './character.dto';
import { AddSkill, DeleteTraitDto } from './character.dto';

// error handling is done inside callApi

export async function fetchCharacter(characterId: string, auth: AuthContextProps): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchCharacters(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Character>> {
  const url = `${apiStrategicGameUrl}/characters?q=${rsql}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function createCharacter(characterData: Partial<Character>, auth: AuthContextProps): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(characterData),
  });
}

export async function updateCharacter(
  characterId: string,
  character: Partial<Character>,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(character),
  });
}

export async function deleteCharacter(characterId: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}`;
  await callApi(auth, url, { method: 'DELETE' });
}

export async function addCharacterSkill(
  characterId: string,
  data: AddSkill,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function deleteCharacterSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined,
  auth: AuthContextProps
): Promise<Character> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}${specializationQuery}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function levelUpSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined,
  auth: AuthContextProps
): Promise<Character> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/level-up${specializationQuery}`;
  return await callApi(auth, url, { method: 'PATCH' });
}

export async function levelDownSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined,
  auth: AuthContextProps
): Promise<Character> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/level-down${specializationQuery}`;
  return await callApi(auth, url, { method: 'PATCH' });
}

export async function setUpProfessionalSkill(
  characterId: string,
  skillId: string,
  specialization: string | undefined,
  types: string[],
  auth: AuthContextProps
): Promise<Character> {
  const specializationQuery = specialization ? `?specialization=${specialization}` : '';
  const url = `${apiStrategicGameUrl}/characters/${characterId}/skills/${skillId}/professional${specializationQuery}`;
  return await callApi(auth, url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ types: types }),
  });
}

export async function equipItem(
  characterId: string,
  slot: string,
  itemId: string,
  auth: AuthContextProps
): Promise<Character> {
  const request = { slot: slot, itemId: itemId };
  const url = `${apiStrategicGameUrl}/characters/${characterId}/equipment`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}

export async function unequipItem(characterId: string, itemId: string, auth: AuthContextProps): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/equipment/${itemId}`;
  return await callApi(auth, url, { method: 'DELETE' });
}

export async function updateCarriedStatus(
  characterId: string,
  itemId: string,
  carried: boolean,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/items/${itemId}/carried/${carried}`;
  return await callApi(auth, url, { method: 'PUT' });
}

export async function transferFactionGold(
  characterId: string,
  amount: number,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/transfer-faction-gold`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
}

export async function levelUpCharacter(
  characterId: string,
  force: boolean,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/level-up?force=${force}`;
  return await callApi(auth, url, { method: 'POST' });
}

/** Spell lists of the character and the spells it knows up to its ranks (spec 029). */
export async function fetchCharacterSpells(characterId: string, auth: AuthContextProps): Promise<KnownSpellList[]> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/spells`;
  return await callApi(auth, url, { method: 'GET' });
}

/** Spends power points: not enough points is a 400 err-insufficient-power. */
export async function spendCharacterPower(
  characterId: string,
  amount: number,
  auth: AuthContextProps
): Promise<Character> {
  return changeCharacterPower(characterId, 'spend', amount, auth);
}

/** Gives back power points, up to the maximum. */
export async function restoreCharacterPower(
  characterId: string,
  amount: number,
  auth: AuthContextProps
): Promise<Character> {
  return changeCharacterPower(characterId, 'restore', amount, auth);
}

async function changeCharacterPower(
  characterId: string,
  change: 'spend' | 'restore',
  amount: number,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/power/${change}`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount }),
  });
}

export async function addCharacterXP(characterId: string, xp: number, auth: AuthContextProps): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/xp`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ xp }),
  });
}

export async function addCharacterTrait(
  characterId: string,
  addTraitDto: AddTraitDto,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/traits`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(addTraitDto),
  });
}

export async function deleteCharacterTrait(
  characterId: string,
  dto: DeleteTraitDto,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/traits`;
  return await callApi(auth, url, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateCharacterTemporaryStat(
  characterId: string,
  dto: UpdateTemporaryStatDto,
  auth: AuthContextProps
): Promise<Character> {
  const url = `${apiStrategicGameUrl}/characters/${characterId}/stats/temporary`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function fetchCharacterSizes(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiStrategicGameUrl}/character-sizes`;
  return await callApi(auth, url, { method: 'GET' });
}
