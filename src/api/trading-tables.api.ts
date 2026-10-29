import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { TradingTables } from './trading-tables.dto';

/** The trading tables of core (spec 048); the API answers 404 while they have not been imported. */
export async function fetchTradingTables(auth: AuthContextProps): Promise<TradingTables> {
  return await callApi(auth, `${apiCoreUrl}/trading-tables`, { method: 'GET' });
}
