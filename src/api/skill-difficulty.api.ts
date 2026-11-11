import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { SkillDifficultyGuide } from './skill-difficulty.dto';

/** The difficulty guide of a skill, or the general scale (`fallback: true`) when it has none. */
export async function fetchSkillDifficulty(skillId: string, auth: AuthContextProps): Promise<SkillDifficultyGuide> {
  const url = `${apiCoreUrl}/skill-difficulties/${encodeURIComponent(skillId)}`;
  return await callApi(auth, url, { method: 'GET' });
}

/** Every difficulty guide, the general scale included. */
export async function fetchSkillDifficulties(auth: AuthContextProps): Promise<SkillDifficultyGuide[]> {
  const url = `${apiCoreUrl}/skill-difficulties`;
  return await callApi(auth, url, { method: 'GET' });
}
