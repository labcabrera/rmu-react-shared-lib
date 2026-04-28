import { assetsBaseUrl } from '../config/config.service';
import { StatKey } from './character.dto';
import { AccessType } from './common.dto';

export const resistances = ['channeling', 'mentalism', 'essence', 'physical', 'poison', 'disease', 'fear'];

export type Race = {
  id: string;
  name: string;
  archetype: string | undefined;
  realmId: string;
  sizeId: string;
  stats: Record<StatKey, number>;
  resistances: RaceResistances;
  averageHeight: GenderBasedStat;
  averageWeight: GenderBasedStat;
  strideBonus: number;
  enduranceBonus: number;
  recoveryMultiplier: number;
  baseHits: number;
  baseDevPoints: number;
  baseAt: number;
  defaultLanguage: string | null;
  talents: string[];
  traits: RaceTrait[];
  skillBonuses: RaceSkillBonus[];
  description: string | undefined;
  imageUrl: string | undefined;
  accessType: AccessType;
};

export type RaceResistances = {
  channeling: number;
  mentalism: number;
  essence: number;
  physical: number;
  poison: number;
  disease: number;
};

export type GenderBasedStat = {
  male: number;
  female: number;
};

export type RaceTrait = {
  id: string;
  traitId: string;
  tier: number | undefined;
  modifier: string | undefined;
  description: string | undefined;
};

export type RaceSkillBonus = {
  skillId: string;
  specialization: string | null;
  bonus: number;
};

export type CreateRaceDto = {
  name: string;
  realmId: string;
  archetype: string | undefined;
  sizeId: string;
  stats: Record<StatKey, number>;
  resistances: RaceResistances;
  averageHeight: GenderBasedStat;
  averageWeight: GenderBasedStat;
  strideBonus: number;
  enduranceBonus: number;
  recoveryMultiplier: number;
  baseHits: number;
  baseDevPoints: number;
  baseAt: number;
  talents: string[];
  traits: RaceTrait[];
  defaultLanguage: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
};

export type UpdateRaceDto = {
  id: string;
  name: string | undefined;
  archetype: string | undefined;
  sizeId: string | undefined;
  stats: Record<StatKey, number>;
  resistances: RaceResistances | undefined;
  averageHeight: GenderBasedStat | undefined;
  averageWeight: GenderBasedStat | undefined;
  strideBonus: number | undefined;
  enduranceBonus: number | undefined;
  recoveryMultiplier: number | undefined;
  baseHits: number | undefined;
  baseDevPoints: number | undefined;
  baseAt: number | undefined;
  talents: string[] | undefined;
  traits: RaceTrait[] | undefined;
  defaultLanguage: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
};

export type AddRaceTraitDto = {
  traitId: string;
  specialization: string | undefined;
  isTalent: boolean;
  tier: number | undefined;
  description: string | undefined;
};

export const raceCreateTemplate = {
  name: '',
  realmId: '',
  archetype: '',
  sizeId: 'medium',
  stats: {
    ag: 0,
    co: 0,
    em: 0,
    in: 0,
    me: 0,
    pr: 0,
    qu: 0,
    re: 0,
    sd: 0,
    st: 0,
  },
  resistances: {
    channeling: 0,
    mentalism: 0,
    essence: 0,
    physical: 0,
    poison: 0,
    disease: 0,
    fear: 0,
  },
  averageHeight: {
    male: 0,
    female: 0,
  },
  averageWeight: {
    male: 0,
    female: 0,
  },
  strideBonus: 0,
  enduranceBonus: 0,
  recoveryMultiplier: 1,
  baseHits: 0,
  baseDevPoints: 60,
  baseAt: 1,
  talents: [],
  traits: [],
  defaultLanguage: null,
  description: '',
  imageUrl: `${assetsBaseUrl}images/races/unknown.png`,
} as unknown as CreateRaceDto;
