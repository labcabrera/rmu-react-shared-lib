import type { Spell } from './spell.dto';
import { NamedEntity } from './common.dto';
import { CharacterCondition, Injury } from './health.dto';

export type StatKey = 'ag' | 'co' | 'em' | 'in' | 'me' | 'pr' | 'qu' | 're' | 'sd' | 'st';
export type Pace = 'creep' | 'walk' | 'jog' | 'run' | 'sprint' | 'dash';
export type EquipmentSlot = 'mainHand' | 'offHand' | 'body' | 'head' | 'arms' | 'legs';
export type CharacterStatus = 'partially_created' | 'created' | 'dead';

export interface Character {
  id: string;
  gameId: string;
  faction: NamedEntity;
  /** Id of the user that owns the character. */
  owner?: string;
  name: string;
  info: CharacterInfo;
  roleplay: CharacterRoleplay;
  experience: CharacterExperience;
  statistics: Record<StatKey, CharacterStat>;
  resistances: CharacterResistance[];
  hp: CharacterHP;
  endurance?: CharacterEndurance;
  power: CharacterPower | null;
  movement: CharacterMovement;
  initiative: CharacterInitiative;
  defense: CharacterDefense;
  skills: CharacterSkill[];
  equipment: CharacterEquipment;
  attacks: CharacterAttack[];
  traits: CharacterTrait[];
  description: string | undefined;
  imageUrl: string | undefined;
  status?: CharacterStatus;
  /** Every injury of the character, healed ones included (spec 013). */
  injuries?: Injury[];
  conditions?: CharacterCondition[];
  healthSummary?: CharacterHealthSummary;
}

export interface CharacterHealthSummary {
  /** Sum of the penalties of the active, recovering and permanent injuries (0 or less). */
  injuryPenalty: number;
  activeInjuries: number;
  /** Hit points lost per round by the injuries that still bleed. */
  bleeding: number;
}

export interface CharacterEndurance {
  base?: number;
  racialBonus?: number;
  customBonus: number;
  max: number;
  current: number;
  accumulator: number;
  fatiguePenalty: number;
}

export interface CreateCharacterDto {
  id: string;
  gameId: string;
  faction: NamedEntity;
  name: string;
  info: CreateCharacterInfoDto;
  roleplay: CharacterRoleplay;
  level: number;
  statistics: Record<StatKey, StatCreationDto>;
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
  /** Optional culture: its ranks are applied before level 1 without spending development points. */
  culture?: CreateCharacterCultureDto;
}

/**
 * Culture chosen at creation. `assignments` distributes the ranks of every entry of `culture.skillRanks` that is not
 * of type `skill` (those are applied automatically); the ranks of each entry must add up exactly to the entry ranks.
 */
export interface CreateCharacterCultureDto {
  cultureId: string;
  assignments?: CultureAssignmentDto[];
}

export interface CultureAssignmentDto {
  /** Index of the entry in `culture.skillRanks`. */
  entry: number;
  skillId: string;
  specialization?: string;
  ranks: number;
}

export interface CreateCharacterInfoDto {
  raceId: string;
  professionId: string;
  /** One realm, or the two of a hybrid profession (spec 029). */
  realmTypes?: string[];
  /** @deprecated Use realmTypes. */
  realmType?: string;
  height: number;
  weight: number;
}

export interface CharacterDefense {
  defensiveBonus: number;
  /** Parts of the defensive bonus by source (quickness, defensive-aura, natural-armor); zeros are omitted. */
  modifiers?: Record<string, number>;
  armor: CharacterArmor;
  shield: CharacterDefenseShield | null;
  protect: number;
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
  /** Realms of the character: two for a hybrid (spec 029). */
  realmTypes: string[];
  /** @deprecated The first realm: use realmTypes. */
  realmType: string;
  height: number;
  weight: number;
  /** Culture chosen at creation, if any. */
  cultureId?: string | null;
  /** Recovery multiplier of the race: it multiplies the healing time (spec 013). */
  recoveryMultiplier?: number;
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

export interface CharacterPower {
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
  /** One realm, or the two of a hybrid profession (spec 029). */
  realmTypes?: string[];
  /** @deprecated Use realmTypes. */
  realmType?: string;
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
  /** `race` traits come from the character's race: they cost nothing and cannot be deleted. */
  source?: CharacterTraitSource;
  /** Development points the trait was paid with, by pool (absent on traits stored before it was tracked). */
  paidWith?: TraitPayment;
  /** The trait does not exist in this installation (an imported character, spec 024): it has no effect. */
  missingReference?: boolean;
}

export interface TraitPayment {
  normal: number;
  bonus: number;
  flaw: number;
  /** Part of the bonus points that counted towards the per level limit. */
  cappedBonus: number;
  /** Character level when the points were spent. */
  level: number;
}

export type CharacterTraitSource = 'character' | 'race';

export interface CharacterSkill {
  id: string;
  skillId: string;
  specialization?: string;
  development: number[];
  category?: string;
  statistics: string[];
  /** Total ranks, culture ranks included. */
  ranks: number;
  /** Ranks developed in the current level. */
  ranksDeveloped: number;
  /** Ranks granted by the culture at creation: the skill cannot be leveled down below them. */
  cultureRanks?: number;
  /** Development points spent on the skill in the current level, by pool. */
  devPointsSpent?: SkillDevPointsSpent;
  statBonus: number;
  racialBonus: number;
  professionalBonus: number;
  developmentBonus: number;
  customBonus: number;
  /** Bonus from the character's traits (talents and flaws), included in totalBonus. */
  traitBonus?: number;
  totalBonus: number;
  professional?: string[];
  /** The skill does not exist in this installation (an imported character, spec 024). */
  missingReference?: boolean;
}

export interface SkillDevPointsSpent {
  normal: number;
  bonus: number;
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

export interface CharacterResistance {
  resistance: string;
  statBonus: number;
  racialBonus: number;
  realmBonus: number;
  customBonus: number;
  /** Bonus from the character's traits, included in totalBonus. */
  traitBonus?: number;
  /** +2 per character level, included in totalBonus. */
  levelBonus?: number;
  totalBonus: number;
}

export interface CharacterExperience {
  level: number;
  availableLevel: number;
  xp: number;
  devPoints: number;
  availableDevPoints: number;
  /** Bonus development points left: race extra points plus the game master creation bonus. */
  availableBonusDevPoints: number;
  /** Bonus points spent in the current level, limited by the game's powerLevel.raceDevPointsPerLevel. */
  bonusDevPointsSpentThisLevel: number;
  /** Points returned by flaws at creation; under the 'flaw-points-at-creation' policy they only pay talents. */
  flawDevPoints: number;
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
  /** Skill used by the attack (null for attacks without a skill). */
  skillId?: string | null;
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

export interface StatCreationDto {
  potential: number;
  temporary: number;
  racial: number | undefined;
}

/** A spell the character knows (spec 029): the spell as rmu-api-spells returns it and its power point cost. */
export interface KnownSpell {
  spell: Spell;
  powerPoints: number;
}

/** A spell list of the character with the spells known up to its ranks (GET /characters/:id/spells). */
export interface KnownSpellList {
  /** base-spell-list, open-spell-list, closed-spell-list or restricted-spell-list */
  skillId: string;
  code: string;
  /** Null when rmu-api-spells has no list with that code. */
  spellListId: string | null;
  name: string | null;
  type: string | null;
  realms: string[];
  ranks: number;
  /** List type modifier of the Spellcasting Roll: +5 own Base, 0 Open, -5 Closed, -10 any other. */
  listTypeModifier: number;
  spells: KnownSpell[];
}
