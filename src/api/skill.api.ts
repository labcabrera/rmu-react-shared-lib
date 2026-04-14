import { getAuthHeaders, mergeJsonHeaders } from '../auth/auth-token-service';
import { apiCoreUrl } from '../config/config.service';
import { Page } from './common.dto';
import { buildErrorFromResponse } from './error-handler';
import { CreateSkillDto, Skill, UpdateSkillDto } from './skill.dto';

export async function fetchSkill(skillId: string): Promise<Skill> {
  const url = `${apiCoreUrl}/skills/${skillId}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function fetchSkills(rsql: string, page: number, size: number): Promise<Page<Skill>> {
  const url = `${apiCoreUrl}/skills?q=${rsql}&page=${page}&size=${size}`;
  const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function createSkill(dto: CreateSkillDto): Promise<Skill> {
  const url = `${apiCoreUrl}/skills`;
  const response = await fetch(url, {
    method: 'POST',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 201) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function updateSkill(id: string, dto: UpdateSkillDto): Promise<Skill> {
  const url = `${apiCoreUrl}/skills/${id}`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: mergeJsonHeaders(),
    body: JSON.stringify(dto),
  });
  if (response.status !== 200) {
    throw await buildErrorFromResponse(response, url);
  }
  return await response.json();
}

export async function deleteSkill(id: string): Promise<void> {
  const url = `${apiCoreUrl}/skills/${id}`;
  const response = await fetch(url, { method: 'DELETE', headers: getAuthHeaders() });
  if (response.status !== 204) {
    throw await buildErrorFromResponse(response, url);
  }
}
