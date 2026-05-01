import { AccessType } from './common.dto';

export type Culture = {
  id: string;
  name: string;
  fixedSkillRanks: CultureSkillRank[];
  description: string | undefined;
  imageUrl: string | undefined;
  accessType: AccessType;
};

export type CultureSkillRank = {
  skillId: string;
  specialization: string | null;
  ranks: number;
};

export type CreateCultureDto = Omit<Culture, 'id'>;

export type UpdateCultureDto = Partial<Omit<CreateCultureDto, 'id'>>;
