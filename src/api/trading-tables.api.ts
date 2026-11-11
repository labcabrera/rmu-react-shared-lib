import { AuthContextProps } from 'react-oidc-context';
import { apiItemsUrl } from '../config/config.service';
import callApi from './api';
import { TradingTables } from './trading-tables.dto';

/** The trading tables of rmu-api-items (specs 048 and 095); the API answers 404 while they have not been imported. */
export async function fetchTradingTables(auth: AuthContextProps): Promise<TradingTables> {
  return await callApi(auth, `${apiItemsUrl}/trading-tables`, { method: 'GET' });
}
