import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { Character } from './character.dto';
import {
  AddInjuryDto,
  HealingLogEntry,
  PermanentRollDto,
  RecoveryRollDto,
  RestDto,
  TreatInjuryDto,
  TreatmentDifficulty,
  TreatmentProcedure,
  UpdateInjuryDto,
} from './health.dto';
import { GiveAntidoteDto, PoisonCharacterDto, PoisonRrResult } from './poison.dto';

// Health of a strategic character (spec 013 §4): every call returns the updated character.

/** Character returned by the recovery roll: `permanentCheckRequired` asks for the permanent injury roll. */
export type RecoveryRollResult = Character & { permanentCheckRequired?: boolean };

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const characterUrl = (characterId: string) => `${apiStrategicGameUrl}/characters/${characterId}`;

export async function addCharacterInjury(
  characterId: string,
  dto: AddInjuryDto,
  auth: AuthContextProps
): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries`, jsonPost(dto));
}

export async function updateCharacterInjury(
  characterId: string,
  injuryId: string,
  dto: UpdateInjuryDto,
  auth: AuthContextProps
): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries/${injuryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function treatCharacterInjury(
  characterId: string,
  injuryId: string,
  dto: TreatInjuryDto,
  auth: AuthContextProps
): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries/${injuryId}/treatments`, jsonPost(dto));
}

/** Difficulty the server would use for the procedure on the injury (core table, head and bleeding). */
export async function fetchCharacterTreatmentDifficulty(
  characterId: string,
  injuryId: string,
  procedure: TreatmentProcedure,
  auth: AuthContextProps
): Promise<TreatmentDifficulty> {
  return await callApi(
    auth,
    `${characterUrl(characterId)}/injuries/${injuryId}/treatment-difficulty?procedure=${encodeURIComponent(procedure)}`,
    { method: 'GET' }
  );
}

export async function rollCharacterInjuryRecovery(
  characterId: string,
  injuryId: string,
  dto: RecoveryRollDto,
  auth: AuthContextProps
): Promise<RecoveryRollResult> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries/${injuryId}/recovery`, jsonPost(dto));
}

export async function rollCharacterInjuryPermanent(
  characterId: string,
  injuryId: string,
  dto: PermanentRollDto,
  auth: AuthContextProps
): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries/${injuryId}/permanent`, jsonPost(dto));
}

export async function restCharacter(characterId: string, dto: RestDto, auth: AuthContextProps): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/rest`, jsonPost(dto));
}

export async function resolveCharacterCondition(
  characterId: string,
  conditionId: string,
  auth: AuthContextProps
): Promise<Character> {
  return await callApi(auth, `${characterUrl(characterId)}/conditions/${conditionId}/resolve`, { method: 'POST' });
}

export async function fetchCharacterHealingLog(
  characterId: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<HealingLogEntry>> {
  return await callApi(auth, `${characterUrl(characterId)}/healing-log?page=${page}&size=${size}`, { method: 'GET' });
}

/** Result of a poison RR of a character: the poisoning when it failed (spec 042). */
export type PoisonCharacterResult = { character: Character; rr: PoisonRrResult; injuryId?: string };

/** Result of an antidote: whether it neutralized the poisoning (spec 042). */
export type CharacterAntidoteResult = { character: Character; injuryId: string; neutralized: boolean };

/** A poison reaches the character: the server resolves its RR and, when it fails, adds the poisoning (spec 042). */
export async function poisonCharacter(
  characterId: string,
  dto: PoisonCharacterDto,
  auth: AuthContextProps
): Promise<PoisonCharacterResult> {
  return await callApi(auth, `${characterUrl(characterId)}/poisonings`, jsonPost(dto));
}

/** An antidote for a poisoning; an item of the character spends one dose (spec 042). */
export async function giveCharacterAntidote(
  characterId: string,
  injuryId: string,
  dto: GiveAntidoteDto,
  auth: AuthContextProps
): Promise<CharacterAntidoteResult> {
  return await callApi(auth, `${characterUrl(characterId)}/injuries/${injuryId}/antidote`, jsonPost(dto));
}
