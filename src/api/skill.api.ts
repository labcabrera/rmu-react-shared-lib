import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi, { Page } from './api';
import { CreateSkillDto, Skill, UpdateSkillDto } from './skill.dto';

export async function fetchSkill(skillId: string, auth: AuthContextProps): Promise<Skill> {
  const url = `${apiCoreUrl}/skills/${skillId}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function fetchSkills(
  rsql: string,
  page: number,
  size: number,
  auth: AuthContextProps
): Promise<Page<Skill>> {
  const url = `${apiCoreUrl}/skills?q=${rsql}&page=${page}&size=${size}`;
  return callApi(auth, url, { method: 'GET' });
}

export async function createSkill(dto: CreateSkillDto, auth: AuthContextProps): Promise<Skill> {
  const url = `${apiCoreUrl}/skills`;
  return await callApi(auth, url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function updateSkill(id: string, dto: UpdateSkillDto, auth: AuthContextProps): Promise<Skill> {
  const url = `${apiCoreUrl}/skills/${id}`;
  return await callApi(auth, url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });
}

export async function deleteSkill(id: string, auth: AuthContextProps): Promise<void> {
  const url = `${apiCoreUrl}/skills/${id}`;
  return await callApi(auth, url, { method: 'DELETE' });
}
