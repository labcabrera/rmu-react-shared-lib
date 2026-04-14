import { getAuthHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { SkillCategory } from './skill-category.dto';

export async function fetchSkillCategory(skillCategoryId: string): Promise<SkillCategory> {
  const url = `${apiCoreUrl}/skill-categories/${skillCategoryId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchSkillCategories(
  rsql: string | undefined,
  page: number,
  size: number
): Promise<Page<SkillCategory>> {
  const url = `${apiCoreUrl}/skill-categories?q=${rsql || ''}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchPagedSkillCategories(
  query: string,
  page: number,
  size: number
): Promise<Page<SkillCategory>> {
  const url = `${apiCoreUrl}/skill-categories?q=${query}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  const json = await response.json();
  return json as Page<SkillCategory>;
}
