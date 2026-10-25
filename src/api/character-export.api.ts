import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { callApiResponse } from './api';
import { ExportDownload, ImportOptions, ImportPreview, ImportResult } from './character-export.dto';

const FILE_NAME_HEADER = 'X-RMU-File-Name';

/** The file name of a `Content-Disposition` header (`filename*=UTF-8''...` first), or the fallback. */
export function fileNameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback;
  const encoded = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim().replace(/^"|"$/g, ''));
    } catch {
      // Falls back to the plain filename.
    }
  }
  const plain = /filename\s*=\s*("([^"]*)"|[^;]+)/.exec(header);
  const name = plain ? (plain[2] ?? plain[1]).trim() : '';
  return name || fallback;
}

async function download(url: string, fallback: string, auth: AuthContextProps): Promise<ExportDownload> {
  const res = await callApiResponse(auth, url, { method: 'GET' });
  return {
    blob: await res.blob(),
    fileName: fileNameFromDisposition(res.headers.get('Content-Disposition'), fallback),
  };
}

export async function exportCharacter(characterId: string, auth: AuthContextProps): Promise<ExportDownload> {
  return download(`${apiStrategicGameUrl}/characters/${characterId}/export`, 'character.rmu.json', auth);
}

export async function exportFaction(factionId: string, auth: AuthContextProps): Promise<ExportDownload> {
  return download(`${apiStrategicGameUrl}/factions/${factionId}/export`, 'faction.rmu.json', auth);
}

function importInit(file: unknown, fileName: string | undefined): RequestInit {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  // Header values must be ASCII.
  if (fileName) headers[FILE_NAME_HEADER] = fileName.replace(/[^\x20-\x7E]/g, '_');
  return { method: 'POST', headers, body: typeof file === 'string' ? file : JSON.stringify(file) };
}

/**
 * Imports a character into a faction, from a character file or one character (`characterRef`) of a faction
 * file. `file` is the parsed JSON or its text. With `dryRun` it returns the preview and writes nothing.
 */
export async function importCharacter(
  factionId: string,
  file: unknown,
  options: ImportOptions & { dryRun: true },
  auth: AuthContextProps
): Promise<ImportPreview>;
export async function importCharacter(
  factionId: string,
  file: unknown,
  options: ImportOptions,
  auth: AuthContextProps
): Promise<ImportResult>;
export async function importCharacter(
  factionId: string,
  file: unknown,
  options: ImportOptions,
  auth: AuthContextProps
): Promise<ImportPreview | ImportResult> {
  const params = new URLSearchParams();
  if (options.dryRun) params.set('dryRun', 'true');
  if (options.characterRef) params.set('characterRef', options.characterRef);
  const query = params.toString();
  const url = `${apiStrategicGameUrl}/factions/${factionId}/character-imports${query ? `?${query}` : ''}`;
  return await callApi(auth, url, importInit(file, options.fileName));
}

/** Imports a faction with its armory and characters into a strategic game. See importCharacter. */
export async function importFaction(
  gameId: string,
  file: unknown,
  options: ImportOptions & { dryRun: true },
  auth: AuthContextProps
): Promise<ImportPreview>;
export async function importFaction(
  gameId: string,
  file: unknown,
  options: ImportOptions,
  auth: AuthContextProps
): Promise<ImportResult>;
export async function importFaction(
  gameId: string,
  file: unknown,
  options: ImportOptions,
  auth: AuthContextProps
): Promise<ImportPreview | ImportResult> {
  const query = options.dryRun ? '?dryRun=true' : '';
  const url = `${apiStrategicGameUrl}/strategic-games/${gameId}/faction-imports${query}`;
  return await callApi(auth, url, importInit(file, options.fileName));
}
