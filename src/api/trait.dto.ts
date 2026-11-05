import { EntityType } from './common.dto';

// The Character Companion adds social contacts and status, wealth, epic talents and mental and special flaws (spec 039).
export const traitCategories = [
  'combat',
  'discipline',
  'magical',
  'physical',
  'racial',
  'senses',
  'other',
  'social',
  'wealth',
  'epic',
  'mental',
  'special',
];

export type TraitPrerequisiteType = 'natural' | 'training' | 'milestone' | 'profession' | 'skill' | 'race';

export type TraitPrerequisite = {
  type: TraitPrerequisiteType;
  /** Profession, skill or race ids: the API sends them comma separated; read them with `traitPrerequisiteValues`. */
  value?: string | string[] | null;
  description?: string | null;
};

/** The ids a prerequisite names, whether the value comes comma separated (as the API sends it) or as a list. */
export const traitPrerequisiteValues = (value: TraitPrerequisite['value']): string[] => {
  const raw = Array.isArray(value) ? value.map(String) : typeof value === 'string' ? value.split(',') : [];
  return raw.map((entry) => entry.trim()).filter(Boolean);
};

export type Trait = {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  name: string;
  category: string;
  isTalent: boolean;
  specialization: string | null;
  isTierBased: boolean;
  maxTier: number | undefined;
  adquisitionCost: number;
  tierCost: number | undefined;
  description: string | undefined;
  /** Character Companion training category (spec 039). */
  talentCategory?: string | null;
  prerequisites?: TraitPrerequisite[] | null;
  /** Ids of the flaws that can lower its cost. */
  possibleFlaws?: string[] | null;
  source?: 'core-law' | 'character-companion' | null;
  owner?: string;
  /** Rulebook (`system`, admin only) or user content (spec 063). */
  entitySource: EntityType;
};

export type CreateTraitDto = Partial<Omit<Trait, 'id' | 'owner'>>;

export type UpdateTraitDto = Partial<Omit<Trait, 'id' | 'owner'>>;
