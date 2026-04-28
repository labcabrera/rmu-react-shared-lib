import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import {
  AbsoluteManeuverResult,
  AbsoluteManeuverTable,
  EnduranceManeuverResult,
  PercentManeuverResult,
} from './maneuver.dto';

export async function fetchPercentManeuver(roll: number, auth: AuthContextProps): Promise<PercentManeuverResult> {
  const url = `${apiCoreUrl}/maneuvers/percent?roll=${roll}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchAbsoluteManeuver(
  roll: number,
  table: string | null,
  unusualEvent: boolean | undefined,
  auth: AuthContextProps
): Promise<AbsoluteManeuverResult> {
  let query = `?roll=${roll}`;
  if (table) query += `&table=${table}`;
  if (unusualEvent) query += `&unusualEvent=${unusualEvent}`;
  const url = `${apiCoreUrl}/maneuvers/absolute${query}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchAbsoluteManeuverTable(
  tableName: string,
  auth: AuthContextProps
): Promise<AbsoluteManeuverTable> {
  const url = `${apiCoreUrl}/maneuvers/absolute/tables/${tableName}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchEnduranceManeuver(
  roll: number,
  unusualEvent: boolean | undefined,
  auth: AuthContextProps
): Promise<EnduranceManeuverResult> {
  let query = `?roll=${roll}`;
  if (unusualEvent) {
    query += `&unusualEvent=${unusualEvent}`;
  }
  const url = `${apiCoreUrl}/maneuvers/endurance${query}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchAbsoluteManeuverTables(auth: AuthContextProps): Promise<string[]> {
  const url = `${apiCoreUrl}/maneuvers/absolute/tables`;
  return await callApi(auth, url, { method: 'GET' });
}
