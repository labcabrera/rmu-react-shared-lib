import type { LostLimb } from './health-079.dto';
import type { StrategicAccess } from './faction.dto';
import { NamedEntity } from './common.dto';
import { CharacterCondition, Injury } from './health.dto';
import type { Spell } from './spell.dto';
import type { CharacterTemporaryModifier } from './temporary-modifier.dto';

export type StatKey = 'ag' | 'co' | 'em' | 'in' | 'me' | 'pr' | 'qu' | 're' | 'sd' | 'st';
export type Pace = 'creep' | 'walk' | 'jog' | 'run' | 'sprint' | 'dash';
export type EquipmentSlot = 'mainHand' | 'offHand' | 'body' | 'head' | 'arms' | 'legs';
export type CharacterStatus = 'partially_created' | 'created' | 'dead';

export interface Character {
  id: string;
  gameId: string;
  /** What the user can do with it (spec 072): `manage` for the masters, `write` for the players of its faction. */
  access?: StrategicAccess;
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
  /** Lasting morale and fear modifiers (workspace spec 068); missing in older responses. */
  temporaryModifiers?: CharacterTemporaryModifier[];
  /** Workspace spec 079, C1: limbs lost for good. */
  lostLimbs?: LostLimb[];
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
  /** Accumulated fatigue penalty, 0-50, shown as a negative modifier; one point recovers per minute of rest (spec 077). */
  fatiguePenalty: number;
}

/** Most fatigue penalty a character accumulates (§5.5, workspace spec 077). */
export const MAX_FATIGUE_PENALTY = 50;

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

/**
 * Pool that pays development points (workspace spec 076, A3): `auto` normal points first and then bonus points,
 * `bonus` bonus points first (up to the per level limit) and then normal points, `normal` only normal points.
 */
export const DEV_POINTS_POOLS = ['auto', 'normal', 'bonus'] as const;
export type DevPointsPool = (typeof DEV_POINTS_POOLS)[number];

/** Skills a Multilingual talent can grant ranks in (workspace spec 076, A7). */
export const MULTILINGUAL_SKILL_IDS = ['language-spoken', 'language-written'] as const;
export type MultilingualSkillId = (typeof MULTILINGUAL_SKILL_IDS)[number];

/** Trait id of the Multilingual talent, which needs `languageRanks` (workspace spec 076). */
export const MULTILINGUAL_TRAIT_ID = 'multilingual';

/** Total ranks a Multilingual talent grants: 10 in one language or 5 + 5 in two (workspace spec 076). */
export const MULTILINGUAL_RANKS = 10;

/** Ranks of a language granted by Multilingual; `specialization` is a key of the `language` enumeration. */
export interface LanguageRanks {
  skillId: MultilingualSkillId;
  specialization: string;
  ranks: number;
}

export interface AddTraitDto {
  traitId: string;
  tier: number | undefined;
  specialization: string | undefined;
  /** Pool that pays the trait (default `auto`); the game's talent policy at creation goes first (spec 076). */
  pool?: DevPointsPool;
  /** Multilingual only: how its 10 ranks are split, at most two languages (spec 076). */
  languageRanks?: LanguageRanks[];
  /** Game option `talentPurchaseRules` (spec 077): prerequisite the new tiers meet; training and milestone, master only. */
  prerequisite?: { type: TraitAcquisitionType; note?: string };
  /** Flaws only (spec 077): the talent it is taken with, among its `possibleFlaws`. */
  linkedTo?: TraitLink;
  /** Game master only (spec 077): it costs half and its sheet effects do not apply. */
  restricted?: TraitRestriction;
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
  /** Size of the race changed by Increased or Decreased Size (workspace spec 077); `sizeId` stays the race one. */
  effectiveSizeId?: string;
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
  /** Skill ranks granted by the talent, removed with it (workspace spec 076: Multilingual). */
  grantedRanks?: TraitGrantedRanks[];
  /** How each tier was acquired (workspace spec 077, game option `talentPurchaseRules`). */
  acquiredBy?: TraitAcquisition[];
  /** Flaws only: the talent it was taken with, among its Possible Flaws (spec 077). */
  linkedTo?: TraitLink;
  /** Only acts in some situations: it cost half and its sheet effects are situational (spec 077). */
  restricted?: TraitRestriction;
  /** A flaw that waits for the approval of the game master (spec 077). */
  pendingApproval?: boolean;
}

/** Prerequisite types a tier of a talent is acquired by (spec 077); same values as `TraitPrerequisiteType`. */
export const TRAIT_ACQUISITION_TYPES = ['natural', 'training', 'milestone', 'profession', 'skill', 'race'] as const;
export type TraitAcquisitionType = (typeof TRAIT_ACQUISITION_TYPES)[number];

/** Prerequisites only the game master grants (`prerequisite` of `AddTraitDto`). */
export const GM_TRAIT_ACQUISITION_TYPES: TraitAcquisitionType[] = ['training', 'milestone'];

/** How one tier of a talent was acquired (spec 077). */
export interface TraitAcquisition {
  tier: number;
  type: TraitAcquisitionType;
  /** The skill, profession or race it met, when the prerequisite names one. */
  value?: string;
  /** Training and milestone: what the game master wrote. */
  note?: string;
}

/** The talent of the character a flaw is taken with (spec 077). */
export interface TraitLink {
  traitId: string;
  specialization?: string;
}

/** A restricted trait: the situations it acts in (spec 077). */
export interface TraitRestriction {
  note: string;
}

/** Ranks a talent granted in a skill (workspace spec 076). */
export interface TraitGrantedRanks {
  skillId: string;
  specialization: string | null;
  ranks: number;
  /** The skill was created for the talent: it is removed with the talent when it keeps no ranks of its own. */
  created: boolean;
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
  /** Skill category of the core catalog, as strategic sends it (workspace spec 039). */
  categoryId?: string;
  /** @deprecated older payloads; use `skillCategoryOf`. */
  category?: string;
  statistics: string[];
  /** Total ranks, culture ranks included. */
  ranks: number;
  /** Ranks developed in the current level. */
  ranksDeveloped: number;
  /** Ranks granted by the culture at creation: the skill cannot be leveled down below them. */
  cultureRanks?: number;
  /** Culture entries (indexes) the culture ranks come from: two entries may grant the same language (spec 076). */
  cultureSources?: number[];
  /** Ranks granted by a talent such as Multilingual (spec 076): they cost no points and are included in `ranks`. */
  talentRanks?: number;
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
  /** Fighting style skills only (spec 032): abilities the ranks were allocated to. */
  styleAbilities?: StyleAbilitySelection[];
  /** Fighting style skills only: ranks not allocated to abilities, and their OB (+2 each, at most +10). */
  styleFreeRanks?: number;
  styleFreeRanksBonus?: number;
}

export interface StyleAbilitySelection {
  abilityId: string;
  times: number;
  /** Ranks paid, as the style costed it when selected. */
  cost: number;
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
  /** Sum of the Enc % of the worn armor pieces that still protect (spec 077). */
  armorEncumbrance?: number;
  /** Load breakdown (spec 077). */
  load?: CharacterLoad;
}

/** Load of a character (spec 077): worn armor scales to the body it was made for. */
export interface CharacterLoad {
  /** Weight (lb) of the equipped items. */
  worn: number;
  /** Weight (lb) of the carried items that are not equipped. */
  carried: number;
  /** Worn plus carried, in % of the body weight (0 without body weight). */
  percent: number;
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
  /** The skill trained intensely this level, the only one with more than two ranks (workspace spec 076, A1). */
  intenseTrainingSkill?: IntenseTrainingSkill | null;
  /** Normal points saved at the last level up, already included in `availableDevPoints` (spec 076, A5). */
  savedDevPoints?: number;
  /** Extra stat gain rolls paid with development points in the last two levels, by pool (spec 076, A4). */
  statGainPayments?: StatGainPayment[];
}

/** Skill marked by intense training in the current level (workspace spec 076). */
export interface IntenseTrainingSkill {
  skillId: string;
  specialization: string | null;
}

/** Development points paid for an extra stat gain roll (workspace spec 076). */
export interface StatGainPayment {
  stat: StatKey;
  normal: number;
  bonus: number;
  level: number;
}

/** The skill is the one trained intensely in the current level (workspace spec 076). */
export const isIntenseTrainingSkill = (
  experience: Pick<CharacterExperience, 'intenseTrainingSkill'> | undefined,
  skill: Pick<CharacterSkill, 'skillId' | 'specialization'>
): boolean => {
  const marked = experience?.intenseTrainingSkill;
  return (
    !!marked && marked.skillId === skill.skillId && (marked.specialization ?? null) === (skill.specialization ?? null)
  );
};

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
  /** Tags of the weapon (spec 032). */
  weaponTags?: string[];
  /** Times St enters the skill bonus of the attack (spec 040). */
  strengthWeight?: number;
  /** The attack uses a two-handed weapon mode (one size bigger, §10). */
  twoHanded?: boolean;
  /** Weapon category used by the multiple attack rules. */
  weaponCategory?: 'dagger' | 'light' | 'natural' | 'standard' | 'unarmed';
  /** The weapon is made for another size than the wielder: it attacks with its own size and -20 (workspace spec 075). */
  wrongSize?: boolean;
  /** Strategic item of the attack (spec 019). */
  itemId?: string | null;
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
  /** Pool that pays an extra stat gain roll (default `auto`, spec 076). */
  pool?: DevPointsPool;
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

