import { AuthContextProps } from 'react-oidc-context';
import { apiStrategicGameUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { ChronicleChapter, CreateChronicleChapterDto, UpdateChronicleChapterDto } from './chronicle.dto';

const chaptersUrl = () => `${apiStrategicGameUrl}/chronicle-chapters`;

/** The chapters of a campaign the user may read, in order, without their content (workspace spec 102). */
export async function fetchChronicleChapters(gameId: string, auth: AuthContextProps): Promise<ChronicleChapter[]> {
  const params = new URLSearchParams({ q: `gameId==${gameId}`, page: '0', size: '1000' });
  const page: Page<ChronicleChapter> = await callApi(auth, `${chaptersUrl()}?${params.toString()}`, { method: 'GET' });
  return page.content;
}

/** A chapter with its Markdown. A private one is a 404 for whoever is not a master of the campaign. */
export async function fetchChronicleChapter(id: string, auth: AuthContextProps): Promise<ChronicleChapter> {
  return callApi(auth, `${chaptersUrl()}/${encodeURIComponent(id)}`, { method: 'GET' });
}

export async function createChronicleChapter(
  data: CreateChronicleChapterDto,
  auth: AuthContextProps
): Promise<ChronicleChapter> {
  return callApi(auth, chaptersUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function updateChronicleChapter(
  id: string,
  data: UpdateChronicleChapterDto,
  auth: AuthContextProps
): Promise<ChronicleChapter> {
  return callApi(auth, `${chaptersUrl()}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

/** Sets the whole order of the chronicle: every chapter id of the campaign, once. */
export async function reorderChronicleChapters(
  gameId: string,
  ids: string[],
  auth: AuthContextProps
): Promise<ChronicleChapter[]> {
  const page: Page<ChronicleChapter> = await callApi(auth, `${chaptersUrl()}/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, ids }),
  });
  return page.content;
}

export async function deleteChronicleChapter(id: string, auth: AuthContextProps): Promise<void> {
  await callApi(auth, `${chaptersUrl()}/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
