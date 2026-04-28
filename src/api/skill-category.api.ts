import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { Page } from './common.dto';
import { SkillCategory } from './skill-category.dto';

export async function fetchSkillCategory(skillCategoryId: string, auth: AuthContextProps): Promise<SkillCategory> {
  const url = `${apiCoreUrl}/skill-categories/${skillCategoryId}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchSkillCategories(
  rsql: string | undefined,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<SkillCategory>> {
  const url = `${apiCoreUrl}/skill-categories?q=${rsql || ''}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}

export async function fetchPagedSkillCategories(
  query: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<SkillCategory>> {
  const url = `${apiCoreUrl}/skill-categories?q=${query}&page=${page}&size=${size}`;
  return await callApi(auth, url, { method: 'GET' });
}
