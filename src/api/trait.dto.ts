export const traitCategories = ['combat', 'discipline', 'magical', 'physical', 'racial', 'senses', 'other'];

export type Trait = {
  id: string;
  name: string;
  category: string;
  isTalent: boolean;
  specialization: string | null;
  isTierBased: boolean;
  maxTier: number | undefined;
  adquisitionCost: number;
  tierCost: number | undefined;
  description: string | undefined;
};

export type CreateTraitDto = Partial<Omit<Trait, 'id'>>;

export type UpdateTraitDto = Partial<Omit<Trait, 'id'>>;
