import { AuthContextProps } from 'react-oidc-context';
import { apiAttackTablesUrl } from '../config/config.service';
import callApi from './api';
import { AttackLookup, AttackTable, CriticalTable, FumbleTable } from './attack-table.dto';

const id = (value: string) => encodeURIComponent(value);

export async function fetchAttackTables(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiAttackTablesUrl}/attack-tables`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchFumbleTables(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiAttackTablesUrl}/fumble-tables`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchCriticalTypes(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiAttackTablesUrl}/critical-tables`;
  return callApi(auth, url, { method: 'GET' });
}

/** The result of an attack roll on a Medium table (only a token is needed). */
export async function lookupAttackTable(
  table: string,
  armorType: number,
  roll: number,
  auth: AuthContextProps
): Promise<AttackLookup> {
  const url = `${apiAttackTablesUrl}/attack-tables/${id(table)}/${armorType}/${roll}`;
  return callApi(auth, url, { method: 'GET' });
}

/** A whole attack table. Rulebook content: 403 without Core Law access. */
export async function fetchAttackTable(table: string, auth: AuthContextProps): Promise<AttackTable> {
  const url = `${apiAttackTablesUrl}/attack-tables/${id(table)}`;
  return callApi(auth, url, { method: 'GET' });
}

/** Every severity (A-E) of a critical type. Rulebook content: 403 without Core Law access. */
export async function fetchCriticalTable(type: string, auth: AuthContextProps): Promise<CriticalTable> {
  const url = `${apiAttackTablesUrl}/critical-tables/${id(type)}`;
  return callApi(auth, url, { method: 'GET' });
}

/** A whole fumble table. Rulebook content: 403 without Core Law access. */
export async function fetchFumbleTable(table: string, auth: AuthContextProps): Promise<FumbleTable> {
  const url = `${apiAttackTablesUrl}/fumble-tables/${id(table)}`;
  return callApi(auth, url, { method: 'GET' });
}
