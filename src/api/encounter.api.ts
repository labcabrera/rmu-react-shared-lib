import { AuthContextProps } from 'react-oidc-context';
import { apiNpcUrl } from '../config/config.service';
import callApi from './api';
import {
  EncounterSettings,
  EncounterTable,
  EncounterTableSummary,
  ResolveEncounterRequest,
  ResolveEncounterResponse,
} from './encounter.dto';

/** Every Creature Law encounter table, without rows (spec 061). */
export async function fetchEncounterTables(auth: AuthContextProps): Promise<EncounterTableSummary[]> {
  const url = `${apiNpcUrl}/encounter-tables`;
  return await callApi(auth, url, { method: 'GET' });
}

/** An encounter table with its subtables and rows; 404 `encounter-table-not-found`. */
export async function fetchEncounterTable(tableId: string, auth: AuthContextProps): Promise<EncounterTable> {
  const url = `${apiNpcUrl}/encounter-tables/${encodeURIComponent(tableId)}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** The Table 15.4a modifiers, the 15.4b differentials and the 15.4c specials. */
export async function fetchEncounterSettings(auth: AuthContextProps): Promise<EncounterSettings> {
  const url = `${apiNpcUrl}/encounter-settings`;
  return await callApi(auth, url, { method: 'GET' });
}

/**
 * Resolves an encounter with every roll made so far (stateless): the check, the tables walked, and either the next
 * roll it needs or the result.
 */
export async function resolveEncounter(
  request: ResolveEncounterRequest,
  auth: AuthContextProps
): Promise<ResolveEncounterResponse> {
  const url = `${apiNpcUrl}/encounters/resolve`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
}
