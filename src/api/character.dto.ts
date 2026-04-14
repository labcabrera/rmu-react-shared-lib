import { NamedEntity } from './common.dto';

export type StatKey = 'ag' | 'co' | 'em' | 'in' | 'me' | 'pr' | 'qu' | 're' | 'sd' | 'st';
export type Pace = 'creep' | 'walk' | 'jog' | 'run' | 'sprint' | 'dash';
export type EquipmentSlot = 'mainHand' | 'offHand' | 'body' | 'head' | 'arms' | 'legs';

export const STATS: StatKey[] = ['ag', 'co', 'em', 'in', 'me', 'pr', 'qu', 're', 'sd', 'st'];
export const PACE_VALUES: Pace[] = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'];
export const EQUIPMENT_SLOTS: EquipmentSlot[] = ['mainHand', 'offHand', 'head', 'body', 'arms', 'legs'];

export interface Character {
  id: string;
  gameId: string;
  faction: NamedEntity;
  name: string;
  info: CharacterInfo;
  roleplay: CharacterRoleplay;
  experience: CharacterExperience;
  statistics: Record<StatKey, CharacterStat>;
  resistances: CharacterResistance[];
  hp: CharacterHP;
  movement: CharacterMovement;
  initiative: CharacterInitiative;
  defense: CharacterDefense;
  skills: CharacterSkill[];
  equipment: CharacterEquipment;
  attacks: CharacterAttack[];
  traits: CharacterTrait[];
  description: string | undefined;
  imageUrl: string | undefined;
}

export interface CreateCharacterDto {
  id: string;
  gameId: string;
  faction: NamedEntity;
  name: string;
  info: CreateCharacterInfoDto;
  roleplay: CharacterRoleplay;
  level: number;
  statistics: CharacterStatistics;
  resistances: CharacterResistance[];
  hp: CharacterHP;
  movement: CharacterMovement;
  initiative: CharacterInitiative;
  defense: CharacterDefense;
  skills: CharacterSkill[];
  equipment: CharacterEquipment;
  attacks: CharacterAttack[];
  traits: CharacterTrait[];
  weaponDevelopment: string[];
  description: string | undefined;
  imageUrl: string | undefined;
}

export interface CreateCharacterInfoDto {
  raceId: string;
  professionId: string;
  realmType: string;
  height: number;
  weight: number;
}

export interface CharacterDefense {
  defensiveBonus: number;
  armor: CharacterArmor;
  shield: CharacterDefenseShield | null;
}

export interface CharacterArmor {
  at: number | null;
  racialAtBonus: number | null;
  headAt: number | null;
  bodyAt: number | null;
  armsAt: number | null;
  legsAt: number | null;
}

export interface CharacterDefenseShield {
  db: number;
  blockCount: number;
}

export interface AddTraitDto {
  traitId: string;
  tier: number | undefined;
  specialization: string | undefined;
}

export interface UpdateCharacterDto {
  name: string | undefined;
  description: string | undefined;
  info:
    | {
        weight: number | undefined;
        height: number | undefined;
      }
    | undefined;
  roleplay:
    | {
        gender: string | undefined;
        age: number | undefined;
      }
    | undefined;
  imageUrl: string | undefined;
}

export interface CharacterInfo {
  race: NamedEntity;
  professionId: string;
  sizeId: string;
  realmType: string;
  height: number;
  weight: number;
}

export interface CharacterMovement {
  baseMovementRate: number;
  modifiers: Record<string, number>;
  maxPace: Pace;
}

export interface CharacterInitiative {
  modifiers: Record<string, number>;
  totalBonus: number;
}

export interface CharacterHP {
  max: number;
  current: number;
}

export interface CharacterRoleplay {
  gender: string;
  age: number;
}

export interface RaceInfo {
  raceId: string;
  raceName?: string;
  professionId: string;
  realmType: string;
  height: number;
  weight: number;
}

export interface CharacterTrait {
  traitId: string;
  traitName: string;
  isTalent: boolean;
  tier: number | undefined;
  cost: number;
  specialization: string | undefined;
}

export interface CharacterSkill {
  id: string;
  skillId: string;
  specialization?: string;
  development: number[];
  category?: string;
  statistics: string[];
  ranks: number;
  ranksDeveloped: number;
  statBonus: number;
  racialBonus: number;
  professionalBonus: number;
  developmentBonus: number;
  customBonus: number;
  totalBonus: number;
  professional?: string[];
}

export interface CharacterEquipment {
  slots: Record<EquipmentSlot, string | null>;
  weight: number;
  weightAllowance: number;
  encumbrancePenalty: number;
  baseManeuverPenalty: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty?: number;
  movementBaseDifficulty?: string | undefined;
}

export interface CharacterItemInfo {
  strength: number;
  length: number;
  weight: number;
  cost: number;
}

export interface CharacterWeaponMode {
  type: string;
  attackTable: string;
  fumbleTable: string;
  sizeAdjustment: number;
}

export interface WeaponInfo {
  skillId: string;
  fumble: string;
  sizeAdjustment: string;
  modes: CharacterWeaponMode[];
}

export interface ArmorInfo {
  at: number;
  slot: string;
  enc: number;
  maneuver: number;
  rangedPenalty: number;
  perception: number;
  baseDifficulty: string;
}

export interface CharacterStat {
  potential: number;
  temporary: number;
  modifiers: Record<string, number>;
  totalBonus: number;
}

export type CharacterStatistics = {
  [key in (typeof STATS)[number]]: CharacterStat;
};

export interface CharacterResistance {
  resistance: string;
  statBonus: number;
  racialBonus: number;
  realmBonus: number;
  customBonus: number;
  totalBonus: number;
}

export interface CharacterExperience {
  level: number;
  availableLevel: number;
  xp: number;
  devPoints: number;
  availableDevPoints: number;
  availableRaceDevPoints: number;
  availableStatLevelUp: number;
  developedStatLevelUp: number;
  weaponDevelopment: string[];
}

export interface AddItemDto {
  name: string;
  itemTypeId: string;
  amount?: number;
  weight?: number;
  length?: number;
  weightPercent?: number;
  strength?: number;
  fumble?: number;
  cost?: number;
}

export interface CharacterAttack {
  attackName: string;
  attackTable: string;
  sizeAdjustment: number;
  fumbleTable: string;
  fumble: number;
  weaponFumble: number;
  bo: number;
  type: string;
  defaultAttack: boolean;
  meleeRange: number | null;
  boModifiers: Record<string, number>;
}

export interface AddSkill {
  skillId: string;
  specialization: string | null;
  ranks: number;
}

export interface DeleteTraitDto {
  traitId: string;
  specialization?: string;
}

export interface UpdateTemporaryStatDto {
  stat: StatKey;
  roll: number;
}
