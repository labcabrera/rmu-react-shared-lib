/**
 * Health contracts of workspace spec 079, block C: lost limbs and amputation (C1, §13.1), healing without rest (C2) and
 * death and revival (C6, §13.2). The strategic calls live in `character-health.api`; the tactical ones in
 * rmu-mfe-tactical, which composes these pieces with its own medical result.
 */
import type { BodySide, ExternalHealerDto, TreatmentResult } from './health.dto';

// ---------------------------------------------------------------------------------------------------------------
// C1: lost limbs and amputation
// ---------------------------------------------------------------------------------------------------------------

export const LOST_LIMB_LOCATIONS = ['arm', 'leg'] as const;
export type LostLimbLocation = (typeof LOST_LIMB_LOCATIONS)[number];

/** `amputation`: cut by a healer; `limb-loss`: a critical or a tourniquet left too long, confirmed by the game master. */
export type LostLimbCause = 'amputation' | 'limb-loss';

/** A limb lost for good: an arm is useless, a leg leaves the character crawling (`creep`). */
export interface LostLimb {
  location: LostLimbLocation;
  side: BodySide;
  at: string;
  cause?: LostLimbCause;
  /** Day of the campaign (strategic only). */
  gameDay?: number;
  tacticalGameId?: string;
  /** The injury that cost the limb. */
  injuryId?: string;
}

/** Fastest pace with a lost leg. */
export const LOST_LEG_MAX_PACE = 'creep';

/** `surgical` (-50, strategic only) or `emergency` (-30, always cauterized; also in tactical). */
export const AMPUTATION_METHODS = ['surgical', 'emergency'] as const;
export type AmputationMethod = (typeof AMPUTATION_METHODS)[number];

export const AMPUTATION_DIFFICULTY: Record<AmputationMethod, number> = { surgical: -50, emergency: -30 };

/** Penalty of each injury of the stump (bone, muscle, skin, and a burn when cauterized). */
export const AMPUTATION_INJURY_PENALTY = -40;

/** `POST v1/characters/:id/amputations`: give either `healerCharacterId` or `healer`. */
export interface AmputateLimbDto {
  method: AmputationMethod;
  location: LostLimbLocation;
  side: BodySide;
  /** Surgical only: the stump is cauterized (an emergency always is). */
  cauterized?: boolean;
  /** The injury that costs the limb: its bleeding and tourniquet end. */
  injuryId?: string;
  healerCharacterId?: string;
  healer?: ExternalHealerDto;
  roll: number;
  /** Override of the game master; the difficulty of the method by default. */
  difficulty?: number;
}

/** What a failed amputation leaves: the critical of the stump (failure) or system shock (absolute failure). */
export interface AmputationConsequence {
  /** S, D, one result lower (`resultShift` -1). */
  critical?: { criticalType: string; criticalSeverity: string; resultShift: number };
  /** Dying for that many d10 rounds; in strategic a note for the game master. */
  systemShock?: { dice: number };
}

/** Answer of `POST v1/characters/:id/amputations`. `TCharacter` is the character of the lib. */
export interface AmputationResult<TCharacter = unknown> {
  character: TCharacter;
  lostLimb: LostLimb;
  result: TreatmentResult;
  roll: number;
  difficulty: number;
  total: number;
  breakdown: { key: string; value: number; rule?: string }[];
  injuryIds: string[];
  consequence: AmputationConsequence;
}

/** `POST v1/actor-rounds/:id/amputations` in tactical: an emergency amputation (-30). */
export interface AmputateActorLimbDto {
  location: LostLimbLocation;
  side: BodySide;
  injuryId?: string;
  healerActorId?: string;
  healer?: ExternalHealerDto;
  roll: number;
  difficulty?: number;
  /** Absolute failure: sum of the 2d10 rounds of system shock; rolled when missing. */
  systemShockRoll?: number;
}

/** Fields the tactical amputation adds to the medical result. */
export interface ActorAmputationFields {
  lostLimb: LostLimb;
  injuryIds: string[];
  /** Failure: the critical alert of the stump. */
  criticalAlertId?: string;
  /** Absolute failure: rounds of the dying effect. */
  dyingRounds?: number;
}

/** `side` of `POST alerts/:alertId/resolve` for a confirmed `limb-loss` alert whose injury has none. */
export interface ConfirmLimbLossDto {
  outcome: 'confirmed';
  side?: BodySide;
}

/** A limb that is lost already. */
export const isLimbLost = (lostLimbs: LostLimb[] | undefined, location: LostLimbLocation, side: BodySide): boolean =>
  (lostLimbs ?? []).some((limb) => limb.location === location && limb.side === side);

// ---------------------------------------------------------------------------------------------------------------
// C2: healing without rest
// ---------------------------------------------------------------------------------------------------------------

/** Sleep hours of a day of an `active` character: the only ones that recover hits. */
export const ACTIVE_SLEEP_HOURS_PER_DAY = 8;

/** A strenuous activity that failed on a treated injury: it is active again and needs a new treatment. */
export interface InjuryStrenuousFailure {
  at: string;
  /** An absolute failure doubled the penalty. */
  absolute: boolean;
  treatmentId?: string;
  previousPenalty?: number;
}

/** `POST v1/characters/:id/injuries/:injuryId/strenuous-failure`. */
export interface StrenuousFailureDto {
  absolute?: boolean;
}

/** Error codes of C2: a recovery roll is one per treatment. */
export const HEALING_079_ERROR_CODES = [
  'err-injury-recovery-rolled',
  'err-injury-treatment-required',
  'err-injury-not-treated',
] as const;

// ---------------------------------------------------------------------------------------------------------------
// C6: death and revival
// ---------------------------------------------------------------------------------------------------------------

/** Rounds after the death before the soul departs (five minutes). */
export const SOUL_DEPARTURE_ROUNDS = 60;

export const REVIVE_METHODS = ['respiratory', 'cardiac', 'defibrillation'] as const;
export type ReviveMethod = (typeof REVIVE_METHODS)[number];

/** Fixed difficulties; a defibrillation goes from -20 (best source) to -70. */
export const REVIVE_DIFFICULTY: Record<Exclude<ReviveMethod, 'defibrillation'>, number> = {
  respiratory: -50,
  cardiac: -100,
};
export const DEFIBRILLATION_DIFFICULTY_RANGE = { min: -70, max: -20 } as const;

/** `POST v1/actor-rounds/:id/revive` in tactical. */
export interface ReviveActorDto {
  method: ReviveMethod;
  healerActorId?: string;
  healer?: ExternalHealerDto;
  roll: number;
  /** Defibrillation: -20 to -70; -20 when missing. */
  defibrillationDifficulty?: number;
  /** Defibrillation: a dangerous source shocks the patient (L critical and hits). */
  dangerousSource?: boolean;
  /** Sum of the d10 of hits of the shock; rolled when missing. */
  shockHitsRoll?: number;
}

/** Fields the revival adds to the medical result. */
export interface ActorReviveFields {
  /** Dead became unconscious. */
  revived: boolean;
  shock?: { criticalSeverity: string; hitsDice: number; hits: number; alertId: string };
}

/** Fields of the actor round of C1 and C6. */
export interface ActorRoundLimbAndLife {
  lostLimbs?: LostLimb[];
  /** Round of the death; null while alive. */
  deathRound?: number | null;
  /** Rounds before the soul departs (0: departed); null while alive. */
  soulRoundsLeft?: number | null;
}

/** Error codes of C1 and C6 in tactical and strategic. */
export const LIMB_AND_LIFE_ERROR_CODES = [
  'err-limb-already-lost',
  'err-limb-loss-location',
  'err-limb-loss-side-required',
  'err-revive-not-dead',
  'err-revive-soul-departed',
  'err-revive-beyond-death-threshold',
  'err-revive-invalid-difficulty',
] as const;

/** Whether a revival may be tried: dead and the soul still there (the server also checks the hits). */
export const canTryRevive = (round: ActorRoundLimbAndLife): boolean =>
  round.deathRound !== null && round.deathRound !== undefined && (round.soulRoundsLeft ?? 0) > 0;
