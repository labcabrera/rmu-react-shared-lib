import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl, apiTacticalUrl } from '../config/config.service';
import callApi from './api';
import { fetchTradingTables } from './trading-tables.api';
import {
  ActorHerbResult,
  HerbSearchDto,
  HerbSearchResult,
  TaxRow,
  UseActorHerbDto,
  UseHerbDto,
  UseHerbResult,
} from './treasure-goods.dto';

// Herbs in play (workspace spec 062 §4) and the taxes of the trading tables (§2).

const jsonPost = (body: unknown): RequestInit => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/**
 * A dose of a healing herb the character carries: the server heals the roll (or rolls the range of the herb), spends
 * the dose and logs it. A herb without a usable effect out of combat is a 400 `herb-without-effect`.
 */
export async function applyCharacterHerb(
  characterId: string,
  dto: UseHerbDto,
  auth: AuthContextProps
): Promise<UseHerbResult> {
  return await callApi(auth, `${apiStrategicGameUrl}/characters/${characterId}/herb-uses`, jsonPost(dto));
}

/** A search for herbs of Treasure Law 2.3: the doses found are added to the character. */
export async function searchCharacterHerbs(
  characterId: string,
  dto: HerbSearchDto,
  auth: AuthContextProps
): Promise<HerbSearchResult> {
  return await callApi(auth, `${apiStrategicGameUrl}/characters/${characterId}/herb-searches`, jsonPost(dto));
}

/** A herb used in combat: heals hits and removes stun rounds of the actor. */
export async function applyActorHerb<T = unknown>(
  actorRoundId: string,
  dto: UseActorHerbDto,
  auth: AuthContextProps
): Promise<ActorHerbResult<T>> {
  return await callApi(auth, `${apiTacticalUrl}/actor-rounds/${actorRoundId}/herbs`, jsonPost(dto));
}

/** Taxes and tolls (Treasure Law table 2-2i) of the trading tables; empty until they are imported. */
export async function fetchTaxation(auth: AuthContextProps): Promise<TaxRow[]> {
  const tables = await fetchTradingTables(auth);
  return tables.taxation ?? [];
}
