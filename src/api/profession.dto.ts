import { AccessType } from './common.dto';

export type RealmType = 'channeling' | 'essence' | 'mentalism';

export type ProfessionArchetype = 'non-spellcaster' | 'semi-spellcaster' | 'pure-spellcaster' | 'hybrid';

export interface Profession {
  id: string;
  archetype: ProfessionArchetype;
  availableRealmTypes: RealmType[];
  fixedRealmTypes: RealmType[];
  skillCosts: ProfessionSkillCosts;
  professionalSkills: [];
  description: string;
  imageUrl?: string;
  accessType: AccessType;
}

export type CreateProfessionDto = Profession;

export type UpdateProfessionDto = Partial<Omit<Profession, 'id'>>;

export interface ProfessionSkillCosts {
  animal: number[];
  awareness: number[];
  'battle-expertise': number[];
  'body-discipline': number[];
  brawn: number[];
  'combat-expertise': number[];
  combat1: number[];
  combat2: number[];
  combat3: number[];
  combat4: number[];
  composition: number[];
  crafting: number[];
  delving: number[];
  environmental: number[];
  gymnastic: number[];
  lore: number[];
  'magical-expertise': number[];
  medical: number[];
  'mental-discipline': number[];
  movement: number[];
  'performance-art': number[];
  'power-manipulation': number[];
  science: number[];
  social: number[];
  'spells-base-open': number[];
  'spells-ritual-magic': number[];
  'spells-closed': number[];
  'spells-arcane': number[];
  'spells-restricted': number[];
  subterfuge: number[];
  technical: number[];
  vocation: number[];
}
