import { getAuthHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { buildErrorFromResponse } from './error-handler';
import {
  AbsoluteManeuverResult,
  AbsoluteManeuverTable,
  EnduranceManeuverResult,
  PercentManeuverResult,
} from './maneuver.dto';

export async function fetchPercentManeuver(roll: number): Promise<PercentManeuverResult> {
  const url = `${apiCoreUrl}/maneuvers/percent?roll=${roll}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchAbsoluteManeuver(
  roll: number,
  table: string | null,
  unusualEvent: boolean | undefined
): Promise<AbsoluteManeuverResult> {
  let query = `?roll=${roll}`;
  if (table) query += `&table=${table}`;
  if (unusualEvent) query += `&unusualEvent=${unusualEvent}`;
  const url = `${apiCoreUrl}/maneuvers/absolute${query}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) throw await buildErrorFromResponse(response, url);
  return await response.json();
}

export async function fetchAbsoluteManeuverTable(tableName: string): Promise<AbsoluteManeuverTable> {
  const url = `${apiCoreUrl}/maneuvers/absolute/tables/${tableName}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) throw await buildErrorFromResponse(response, url);
  return await response.json();
}

export async function fetchEnduranceManeuver(
  roll: number,
  unusualEvent: boolean | undefined
): Promise<EnduranceManeuverResult> {
  let query = `?roll=${roll}`;
  if (unusualEvent) {
    query += `&unusualEvent=${unusualEvent}`;
  }
  const url = `${apiCoreUrl}/maneuvers/endurance${query}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchAbsoluteManeuverTables(): Promise<string[]> {
  const url = `${apiCoreUrl}/maneuvers/absolute/tables`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}
