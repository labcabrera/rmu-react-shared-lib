import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import {
  CraftItemDto,
  DiscardItemDto,
  EconomyRules,
  ItemLedgerEntry,
  ItemOperationResult,
  PriceQuote,
  PurchaseItemDto,
  QuotePriceDto,
  RepairItemDto,
  SellItemDto,
  TransferItemDto,
} from './item-operations.dto';
import { StrategicItem } from './strategic-item.dto';

// Operations on the items and gold of characters and factions (rmu-api-strategic, workspace spec 023). Each one
// answers the item as it is now and its entry of the item ledger.

const post = <T>(auth: AuthContextProps, path: string, body: object): Promise<T> =>
  callApi(auth, `${apiStrategicGameUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

export const purchaseItem = (dto: PurchaseItemDto, auth: AuthContextProps): Promise<ItemOperationResult> =>
  post(auth, '/items/purchases', dto);

export const sellItem = (itemId: string, dto: SellItemDto, auth: AuthContextProps): Promise<ItemOperationResult> =>
  post(auth, `/items/${itemId}/sale`, dto);

export const transferItem = (
  itemId: string,
  dto: TransferItemDto,
  auth: AuthContextProps
): Promise<ItemOperationResult> => post(auth, `/items/${itemId}/transfer`, dto);

export const discardItem = (
  itemId: string,
  dto: DiscardItemDto,
  auth: AuthContextProps
): Promise<ItemOperationResult> => post(auth, `/items/${itemId}/discard`, dto);

export const craftItem = (dto: CraftItemDto, auth: AuthContextProps): Promise<ItemOperationResult> =>
  post(auth, '/items/crafts', dto);

export const repairItem = (itemId: string, dto: RepairItemDto, auth: AuthContextProps): Promise<ItemOperationResult> =>
  post(auth, `/items/${itemId}/repairs`, dto);

/** Price of a purchase or a sale without making it. */
export const quoteItemPrice = (dto: QuotePriceDto, auth: AuthContextProps): Promise<PriceQuote> =>
  post(auth, '/items/price-quotes', dto);

/** The ledger, newest first: RSQL on itemId, holderIds, gameId or kind. */
export async function fetchItemLedger(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<ItemLedgerEntry>> {
  const url = `${apiStrategicGameUrl}/item-ledger?q=${encodeURIComponent(rsql)}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchEconomyRules(auth: AuthContextProps): Promise<EconomyRules> {
  return await callApi(auth, `${apiStrategicGameUrl}/economy-rules`, { method: 'GET' });
}

/** Coats a weapon with one dose of a liquid or paste poison of the same holder (spec 042). */
export const coatItem = (itemId: string, poisonItemId: string, auth: AuthContextProps): Promise<ItemOperationResult> =>
  post(auth, `/items/${itemId}/coating`, { poisonItemId });

/** Removes the poison of a weapon, when it dried or was wiped (spec 042). */
export async function removeItemCoating(itemId: string, auth: AuthContextProps): Promise<StrategicItem> {
  return await callApi(auth, `${apiStrategicGameUrl}/items/${itemId}/coating`, { method: 'DELETE' });
}
