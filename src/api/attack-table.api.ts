import { AuthContextProps } from 'react-oidc-context';
import { apiAttackTablesUrl } from '../config/config.service';
import callApi from './api';

export async function fetchAttackTables(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiAttackTablesUrl}/attack-tables`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchFumbleTables(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiAttackTablesUrl}/fumble-tables`;
  return callApi(auth, url, { method: 'GET' });
}
