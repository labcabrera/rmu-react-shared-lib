import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl, apiStrategicGameUrl } from '../config/config.service';
import callApi from './api';
import {
  ChangeChargesDto,
  CreateMagicItemDto,
  GemCutFactor,
  MagicItemQuote,
  MagicItemRequest,
} from './magic-item.dto';
import { StrategicItem } from './strategic-item.dto';
import { TreasureTablesDto } from './treasure-tables.dto';
import { TreasureAwardDto, TreasureAwardResult, TreasureRoll, TreasureRollRequest } from './treasure.dto';

// Magic items, charges, gems and random treasure of rmu-api-strategic, and the treasure tables of rmu-api-core
// (workspace spec 067).

const send = <T>(auth: AuthContextProps, path: string, method: string, body?: object): Promise<T> =>
  callApi(auth, `${apiStrategicGameUrl}${path}`, {
    method,
    ...(body ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {}),
  });

const itemPath = (itemId: string, path: string) => `/items/${encodeURIComponent(itemId)}${path}`;

/** Random treasure, random gem and standard price tables (Treasure Law access); 404 until they are imported. */
export const fetchTreasureTables = (auth: AuthContextProps): Promise<TreasureTablesDto> =>
  callApi(auth, `${apiCoreUrl}/treasure-tables`, { method: 'GET' });

/** Works out a treasure from the dice rolled in the client: its lines, or the next die in `pending`. Stores nothing. */
export const rollTreasure = (dto: TreasureRollRequest, auth: AuthContextProps): Promise<TreasureRoll> =>
  send(auth, '/treasure/rolls', 'POST', dto);

/** Gives the chosen lines to a holder: gold and items with a `treasure` ledger entry, all or nothing. */
export const awardTreasure = (dto: TreasureAwardDto, auth: AuthContextProps): Promise<TreasureAwardResult> =>
  send(auth, '/treasure/awards', 'POST', dto);

/** Days, item level and price (gold) of a magic item, without creating it. */
export const quoteMagicItem = (dto: MagicItemRequest, auth: AuthContextProps): Promise<MagicItemQuote> =>
  send(auth, '/items/magic/quote', 'POST', dto);

/** Creates a magic item for a holder, charged to the payer (`none` is a gift). */
export const createMagicItem = (dto: CreateMagicItemDto, auth: AuthContextProps): Promise<StrategicItem> =>
  send(auth, '/items/magic', 'POST', dto);

/** Spends (negative delta) or adds charges, or recharges the item (charged to its holder). */
export const changeCharges = (itemId: string, dto: ChangeChargesDto, auth: AuthContextProps): Promise<StrategicItem> =>
  send(auth, itemPath(itemId, '/charges'), 'POST', dto);

/** Recharges an item to its max charges: 2 sp per day of recharge, charged to its holder. */
export const rechargeItem = (itemId: string, auth: AuthContextProps): Promise<StrategicItem> =>
  changeCharges(itemId, { recharge: true }, auth);

/** A modern cut of a gem (×5 or ×10 of its value); 10 % of the new value is charged to the holder. */
export const cutGem = (itemId: string, cutFactor: GemCutFactor, auth: AuthContextProps): Promise<StrategicItem> =>
  send(auth, itemPath(itemId, '/cut'), 'POST', { cutFactor });

/** Sets a gem of the same holder in an item: the gem stops being a loose item. */
export const setGem = (itemId: string, gemItemId: string, auth: AuthContextProps): Promise<StrategicItem> =>
  send(auth, itemPath(itemId, '/settings'), 'POST', { gemItemId });

/** Takes the gem at that index out of the item, back to the inventory. */
export const unsetGem = (itemId: string, index: number, auth: AuthContextProps): Promise<StrategicItem> =>
  send(auth, itemPath(itemId, `/settings/${index}`), 'DELETE');
