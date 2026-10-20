import { AccessType } from './common.dto';

export type CultureSkillRankType = 'skill' | 'skill-choice' | 'category-pool' | 'languages' | 'region';

export type CultureRegion = 'own' | 'neighboring';

/**
 * One typed entry of a culture's skill ranks. Which optional fields apply depends on the type:
 * - skill: skillId and optional specialization (fixed ranks).
 * - skill-choice: skillIds (1+) and optional maxRanksPerSkill; the player picks the specialization.
 * - category-pool: categoryIds (1+) and optional maxRanksPerSkill.
 * - languages: only ranks, spread between spoken and written languages.
 * - region: skillId and region.
 */
export type CultureSkillRank = {
  type: CultureSkillRankType;
  skillId?: string;
  skillIds?: string[];
  specialization?: string;
  categoryIds?: string[];
  ranks: number;
  maxRanksPerSkill?: number;
  region?: CultureRegion;
};

export type Culture = {
  id: string;
  name: string;
  skillRanks: CultureSkillRank[];
  languages?: string[];
  suggestedCrafts?: string;
  suggestedVocations?: string;
  /** Indicative development cost computed by the API (read-only). */
  developmentCost?: number;
  description: string | undefined;
  imageUrl: string | undefined;
  owner?: string;
  accessType: AccessType;
};

export type CreateCultureDto = Omit<Culture, 'id' | 'developmentCost' | 'owner'>;

export type UpdateCultureDto = Partial<CreateCultureDto>;
