// Health model shared by the strategic and the tactical modules (spec 013 §1): injuries with a stable UUID and
// their origin, treatments, recovery, conditions and the healing log of a character.
import type { RollModifier } from '../rmu/RollBreakdown';
import type { RuleParams } from '../rmu/RuleHint';
import type { Pace } from './character.dto';
import { InjuryPoison } from './poison.dto';
import type { TreatmentHerb } from './treasure-goods.dto';

export type InjuryType = 'bone' | 'cut-burn' | 'muscle-tendon' | 'organ' | 'poison-disease' | 'skin-tissue' | 'unknown';

export type InjurySeverity = 'light' | 'medium' | 'severe';

export type BodyLocation = 'head' | 'chest' | 'abdomen' | 'arm' | 'leg';

export type BodySide = 'left' | 'right';

export type InjuryStatus = 'active' | 'recovering' | 'permanent' | 'healed';

export type InjuryFlag = 'permanent-risk' | 'limb-loss' | 'blinding' | 'paralysis';

export type BleedingControl = 'pressure' | 'stitches' | 'tourniquet' | 'cauterized' | 'magic';

/** `hazard`: a fall or a falling object (workspace spec 077). */
export type InjurySourceKind = 'critical' | 'fumble' | 'fatigue' | 'manual' | 'poison' | 'hazard';

/** Where an injury, an effect or a condition comes from. */
export interface InjurySource {
  kind: InjurySourceKind;
  tacticalGameId?: string;
  tacticalGameName?: string;
  actionId?: string;
  round?: number;
  attackerId?: string;
  attackerName?: string;
  /** `${table}-${severity}-${roll}`, e.g. "S-C-91". */
  criticalKey?: string;
  /** The poisoning a condition or an effect comes from (spec 042). */
  injuryId?: string;
}

export type TreatmentProcedure =
  | 'pressure'
  | 'stitches'
  | 'tourniquet'
  | 'cauterize'
  | 'dress'
  | 'splint'
  | 'cast'
  | 'salve'
  | 'surgery'
  | 'magic'
  | 'herbs'
  /** Workspace spec 068: a `medical` action of the tactical module on a dying effect (not an injury treatment). */
  | 'stabilize';

/** Workspace spec 068: what holds up a cast leg; the pace limit depends on it. */
export type CastSupport = 'none' | 'cane' | 'crutches';

export const CAST_SUPPORTS: CastSupport[] = ['none', 'cane', 'crutches'];

/** Workspace spec 068: what reopens a treated wound (completed pressure: exertion; stitches: a failed roll). */
export type InjuryReopenOn = 'exertion' | 'failed-roll';

/**
 * Workspace spec 068, decision 10: what a splint or a cast leaves on the injury, the fastest pace of a leg, a useless
 * arm and the factor of the maneuver penalty (a cast halves it; the recovery penalty does not change).
 */
export interface InjuryLimits {
  pace?: Pace | null;
  limbUnusable?: boolean;
  maneuverPenaltyFactor?: number | null;
}

/** Workspace spec 068: a tourniquet on the wound, by round numbers of the tactical game. */
export interface InjuryTourniquet {
  tightSince: number;
  loosenedAt: number | null;
  /** Tactical only: bleeding it stopped, which the wound bleeds the round it is loosened. */
  bleeding?: number;
}

export type TreatmentResult = 'absolute-failure' | 'failure' | 'partial-success' | 'success' | 'absolute-success';

export type HealingType = 'none' | 'medicine' | 'medicine-absolute' | 'magic-or-herbs' | 'magic-and-herbs';

export interface InjuryTreatmentHealer {
  characterId?: string;
  actorId?: string;
  name: string;
  external?: boolean;
  bonus: number;
  /** Own injury penalties of a healer character, already added to the total (spec 022). */
  penalty?: number;
}

/** Where the difficulty of a treatment comes from: the core table (or its default) or the game master (spec 022). */
export type TreatmentDifficultySource = 'table' | 'override';

export interface InjuryTreatment {
  id: string;
  procedure: TreatmentProcedure;
  healer: InjuryTreatmentHealer;
  /** Difficulty modifier applied. */
  difficulty: number;
  /** Missing in treatments before spec 022 and in the tactical ones. */
  difficultySource?: TreatmentDifficultySource;
  roll: number;
  total: number;
  result: TreatmentResult;
  healingType: HealingType;
  /** Recovery modifier from the core medical table. */
  recoveryModifier: number;
  at: string;
  context: 'tactical' | 'strategic';
  tacticalGameId?: string;
  /** Severity of the heat critical a cauterization inflicts, for the game master to resolve (e.g. "A"). */
  heatCritical?: string;
  /** Spec 062: the herb of the character it used (one dose spent) and the bonuses it gave. */
  herb?: TreatmentHerb;
  /** Workspace spec 068: `completed-after-combat` for a tactical treatment the end of the game completed. */
  note?: string;
  /** Workspace spec 068: what holds up a cast leg. */
  castSupport?: CastSupport;
  /** Workspace spec 068: recovery modifier of a salve chosen by the game master. */
  salveModifier?: number;
  /** Workspace spec 068: d10 of hits of the heat of a cauterization, for the game master to roll. */
  heatHitsDice?: number;
  /** Workspace spec 068: the unmodified roll of a cauterization was its unusual event. */
  unusualEvent?: boolean;
}

/**
 * Workspace spec 068, §2: a treatment declared as a tactical `medical` action and not finished yet. The Medicine roll
 * is made when the action is first resolved, and the treatment is applied when its rounds are done.
 */
export interface TreatmentInProgress {
  /** The first action of the treatment (its continuations keep it). */
  actionId: string;
  healerActorId: string;
  procedure: TreatmentProcedure;
  startedRound: number;
  rounds: number;
  roll: number;
  total: number;
  result: TreatmentResult;
  recoveryModifier?: number;
  injuryPenalty?: number;
  difficulty?: number;
  healer?: InjuryTreatmentHealer;
  unmodifiedRoll?: number;
  castSupport?: CastSupport;
  salveModifier?: number | null;
  /** Bleeding before the procedure: pressure keeps it stopped while it is held. */
  bleeding?: number;
}

export interface InjuryRecovery {
  roll: number;
  modifiers: number;
  /** The modifiers entry by entry, with their rules (spec 052). */
  breakdown?: RollModifier[];
  /** Where the days come from: the table column and each multiplier (spec 052). */
  days?: RuleParams;
  total: number;
  /** Days by injury type and result, times the severity. */
  baseDays: number;
  /** Race times talents (Fast/Slow Healer). */
  multiplier: number;
  /** Rounded up, at least 1. */
  totalDays: number;
  remainingDays: number;
  startedAt: string;
  /** Treatment the roll used (none when untreated): one recovery roll per treatment (spec 022). */
  treatmentId?: string;
  /** Rolled without care (no treatment or a failed one): the injury becomes permanent when it ends (spec 022). */
  untreated?: boolean;
}

export interface InjuryPermanent {
  penalty: number;
  roll?: number;
}

export interface Injury {
  /** UUID, stable between the strategic and the tactical modules. */
  id: string;
  type: InjuryType;
  severity: InjurySeverity;
  location?: BodyLocation;
  side?: BodySide;
  /** Current penalty, 0 or less. */
  penalty: number;
  initialPenalty: number;
  /** Hit points per round; 0 means stopped. */
  bleeding?: number;
  bleedingControl?: BleedingControl;
  flags?: InjuryFlag[];
  /** Free text of the game master. */
  description?: string;
  source: InjurySource;
  treatments: InjuryTreatment[];
  recovery?: InjuryRecovery;
  permanent?: InjuryPermanent;
  status: InjuryStatus;
  createdAt: string;
  updatedAt?: string;
  healedAt?: string;
  /** Day of the campaign when it was received (spec 065); absent in older injuries. */
  gameDay?: number;
  /** A poisoning (spec 042): its stages, RR and antidotes. */
  poison?: InjuryPoison;
  /** Workspace spec 068: limits of a splint or a cast; cleared when the injury heals or by the game master. */
  limits?: InjuryLimits | null;
  /** Workspace spec 068: what reopens the wound in a tactical game. */
  reopenOn?: InjuryReopenOn | null;
  /** Workspace spec 068, tactical only: the bleeding the wound takes again when it reopens. */
  reopenBleeding?: number | null;
  /** Workspace spec 068: a tourniquet on the wound. */
  tourniquet?: InjuryTourniquet | null;
  /** Workspace spec 068, tactical only: the treatment of a `medical` action in progress. */
  treatmentInProgress?: TreatmentInProgress | null;
}

export type CharacterConditionStatus = 'unconscious' | 'permanent-unconscious' | 'dead';

export interface CharacterCondition {
  id: string;
  status: CharacterConditionStatus;
  source: InjurySource;
  description?: string;
  createdAt: string;
  resolvedAt?: string;
}

export type HealingLogKind =
  | 'tactical-outcome'
  | 'treatment'
  | 'recovery-roll'
  | 'permanent-roll'
  | 'rest'
  | 'manual'
  /** Spec 062: a dose of a healing herb. */
  | 'herb';

export interface HealingLogEntry {
  id: string;
  at: string;
  kind: HealingLogKind;
  injuryId?: string;
  tacticalGameId?: string;
  healerName?: string;
  /** Day of the campaign when it happened (spec 065); absent in older entries. */
  gameDay?: number;
  /** Data to show with i18n. */
  summary: Record<string, unknown>;
}

/** Fate chosen at the end of a tactical game for a character who bleeds or is dying. */
export type CharacterFate = 'dead' | 'permanent-unconscious';

// Requests of the strategic character health endpoints (spec 013 §4).

/** `POST v1/characters/:id/injuries`: manual injury of the game master. */
export interface AddInjuryDto {
  type: InjuryType;
  severity?: InjurySeverity;
  location?: BodyLocation;
  side?: BodySide;
  penalty: number;
  bleeding?: number;
  flags?: InjuryFlag[];
  description?: string;
}

/** `PATCH v1/characters/:id/injuries/:injuryId`. */
export interface UpdateInjuryDto {
  type?: InjuryType;
  severity?: InjurySeverity;
  location?: BodyLocation | null;
  side?: BodySide | null;
  penalty?: number;
  initialPenalty?: number;
  bleeding?: number;
  bleedingControl?: BleedingControl;
  flags?: InjuryFlag[];
  description?: string;
  permanent?: InjuryPermanent | null;
  status?: InjuryStatus;
  /** Workspace spec 068: limits of a splint or a cast; null removes them. */
  limits?: InjuryLimits | null;
}

/** Healer given by hand (not a character of the campaign). */
export interface ExternalHealerDto {
  name: string;
  bonus: number;
  /** Herbalism bonus of the external healer (strategic treatments). */
  herbalismBonus?: number;
}

/** `POST v1/characters/:id/injuries/:injuryId/treatments`: give either `healerCharacterId` or `healer`. */
export interface TreatInjuryDto {
  procedure: TreatmentProcedure;
  healerCharacterId?: string;
  healer?: ExternalHealerDto;
  /** Not needed for magic, which takes no Medicine roll. */
  roll?: number;
  /** Difficulty override of the game master; without it the server computes it from the core table (spec 022). */
  difficulty?: number;
  healingType?: HealingType;
  /** Herbalism roll; a success adds +25 to the Medicine roll. Give `healerCharacterId` or `bonus`. */
  herbalism?: { healerCharacterId?: string; bonus?: number; roll: number };
  /**
   * Spec 062: a herb of the character that treats the injury (+25 to Medicine, +50 to the recovery roll, +75 with
   * magic; a mundane herb only +25). One dose is spent; a herb that does not treat it is a 400 `herb-not-applicable`.
   */
  herbItemId?: string;
  /** Workspace spec 068: a cast on a leg, its fastest pace is that of the cast alone, with a cane or with crutches. */
  castSupport?: CastSupport;
  /** Workspace spec 068: salve, the recovery modifier the game master chooses within the range of the core tables. */
  salveModifier?: number;
}

/** `POST v1/actor-rounds/:id/injuries/:injuryId/treatments` in the tactical module. */
export interface TreatActorInjuryDto {
  procedure: Extract<TreatmentProcedure, 'pressure' | 'stitches' | 'tourniquet' | 'cauterize' | 'dress' | 'magic'>;
  /** Another actor of the game (or the same one). */
  healerActorId?: string;
  /** External healer. */
  healer?: ExternalHealerDto;
  roll: number;
  /** Defaults to the difficulty of the procedure. */
  difficulty?: number;
  /** Workspace spec 068: support of a cast leg. */
  castSupport?: CastSupport;
  /** Workspace spec 068: recovery modifier of a salve. */
  salveModifier?: number;
}

/** `GET v1/characters/:id/injuries/:injuryId/treatment-difficulty?procedure=`: the difficulty the server uses. */
export interface TreatmentDifficulty {
  procedure: TreatmentProcedure;
  /** Difficulty key (see MANEUVER_DIFFICULTIES) after the head step; none for magic and herbs. */
  grade?: string;
  /** Steps harder because the injury is on the head. */
  headSteps: number;
  /** Modifier of the difficulty, the head step included. */
  base: number;
  /** Extra modifier of cauterizing a bleeding wound. */
  bleedingModifier: number;
  /** Total difficulty modifier of the Medicine roll. */
  difficulty: number;
  /** A row of the core table matched; false means the medium default. */
  matched: boolean;
  /** The procedure applies to the injury; without an override the server refuses it otherwise. */
  applicable: boolean;
}

/** `POST v1/characters/:id/injuries/:injuryId/recovery`. */
export interface RecoveryRollDto {
  roll: number;
}

/** `POST v1/characters/:id/injuries/:injuryId/permanent`. */
export interface PermanentRollDto {
  roll: number;
}

/** `POST v1/characters/:id/rest`. */
export interface RestDto {
  /** Minutes of rest (spec 077): fatigue recovers one point per minute of the whole rest. */
  minutes?: number;
  hours?: number;
  days?: number;
  fullRest?: boolean;
}

/** Where a change of hits of a tactical game comes from (spec 013, §1.1). */
/** `spasm`: an upkeep spasm (workspace spec 076). `hazard`: a fall or a falling object (workspace spec 077). */
export type HpLogKind =
  | 'attack'
  | 'critical'
  | 'fumble'
  | 'bleeding'
  | 'endurance'
  | 'treatment'
  | 'manual'
  | 'poison'
  | 'spasm'
  | 'hazard';

export const HP_LOG_KINDS: HpLogKind[] = [
  'attack',
  'critical',
  'fumble',
  'bleeding',
  'endurance',
  'treatment',
  'manual',
  'poison',
  'spasm',
  'hazard',
];

/** A change of the hits of an actor round: negative is damage, positive healing. */
export interface HpLogEntry {
  id: string;
  round: number;
  /** 0 before the action phases, 1-4 in them, 5 in the upkeep. */
  phase?: number;
  amount: number;
  kind: HpLogKind;
  actionId?: string;
  attackerId?: string;
  attackerName?: string;
  /** The injury that bleeds or is treated. */
  injuryId?: string;
  criticalKey?: string;
  at: string;
}

/** Totals of a hits log by kind and by attacker. */
export interface HpBySource {
  byKind: Partial<Record<HpLogKind, number>>;
  byAttacker: { attackerId: string; attackerName?: string; amount: number }[];
}
