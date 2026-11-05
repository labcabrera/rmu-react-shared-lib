/**
 * Tactical contracts of workspace spec 079, block B (Core Law ch. 3 similar and complementary skills, §3.4, §3.5, §3.14,
 * §5.2), shared by the MFEs that read maneuvers, actor rounds and spell rolls. As `combat-block-a-079.dto`, these are the
 * pieces the spec adds to DTOs that live in rmu-mfe-tactical.
 */

// ---------------------------------------------------------------------------------------------------------------
// Purposes
// ---------------------------------------------------------------------------------------------------------------

/** Maneuver purposes added by block B. */
export const BLOCK_B_MANEUVER_PURPOSES = ['feat-of-strength', 'adrenal', 'fortitude'] as const;
export type BlockBManeuverPurpose = (typeof BLOCK_B_MANEUVER_PURPOSES)[number];

/** Skill each purpose rolls: Weight Training, one of the adrenal skills, or Fortitude. */
export const WEIGHT_TRAINING_SKILL_ID = 'weight-training';
export const FORTITUDE_SKILL_ID = 'fortitude';

// ---------------------------------------------------------------------------------------------------------------
// B1: similar and complementary skills
// ---------------------------------------------------------------------------------------------------------------

/** Relation between the skill rolled and the one needed (Table 3-0c). */
export const SKILL_RELATIONS = ['same-skill', 'same-category', 'other-category'] as const;
export type SkillRelation = (typeof SKILL_RELATIONS)[number];

export const SKILL_RELATION_PENALTIES: Record<SkillRelation, number> = {
  'same-skill': -25,
  'same-category': -50,
  'other-category': -75,
};

/** How similar the game master rules the skills: very similar (0), similar (-25), slightly similar (-50). */
export const SIMILARITY_VALUES = [0, -25, -50] as const;
export type SimilarityValue = (typeof SIMILARITY_VALUES)[number];

/** `similarity` of `PATCH /actions/:id/maneuver/resolve`: the skill rolled is similar to `targetSkillId`. */
export interface SimilarityChoice {
  targetSkillId: string;
  targetSpecialization?: string | null;
  similarity: SimilarityValue;
  /** The relation the game master rules; read from the skill categories when left out. */
  relation?: SkillRelation;
}

/** One entry of `complementary`: an actor of the same game (none: the one who rolls) and its skill. */
export interface ComplementaryHelper {
  actorId?: string;
  skillId: string;
  specialization?: string | null;
}

/** At most 10 helpers in a request. */
export const MAX_COMPLEMENTARY_HELPERS = 10;

/** Ranks the `index`-th helper adds: the first all of its ranks, each next one half the one before (rounded down). */
export const complementaryRanks = (ranks: number, index: number): number => Math.floor(Math.max(0, ranks) / 2 ** index);

/** Query value of a helper in `GET /actions/:id/maneuver/modifiers?complementary=`: `actorId:skillId:specialization`. */
export const complementaryQueryValue = (helper: ComplementaryHelper): string =>
  `${helper.actorId ?? ''}:${helper.skillId}:${helper.specialization ?? ''}`;

/** Roll modifier keys of the aids (group `skill`), also listed in `aids` of the modifiers listing. */
export const SKILL_AID_MODIFIER_KEYS = [
  'similar-skill-relation',
  'similar-skill-similarity',
  'complementary-skill',
] as const;

// ---------------------------------------------------------------------------------------------------------------
// B2: feats of strength
// ---------------------------------------------------------------------------------------------------------------

/** `featOfStrength` of the resolve request (and of the maneuver modifiers): the load and its mechanical advantage. */
export interface FeatOfStrengthChoices {
  /** Pounds. */
  loadWeight: number;
  /** 0.01-1; 1 when left out, 0.5 dragged. */
  mechanicalFactor?: number;
  /** Body weight of an actor without a sheet that gives it (NPC). */
  bodyWeight?: number;
  /** St bonus of an actor without a sheet that gives it (NPC); 0 when left out. */
  strengthBonus?: number;
}

/** `ActionManeuverResult.featOfStrength` and `featOfStrength.result` of the listing: how the difficulty was found. */
export interface FeatOfStrengthResult {
  loadWeight: number;
  mechanicalFactor: number;
  effectiveLoad: number;
  bodyWeight: number;
  weightMultiplier: number;
  strengthBonus: number;
  percent: number;
  /** The percent less 2 × St bonus: the row of the difficulty. */
  adjustedPercent: number;
  difficulty: string;
  /** Beyond the last row: Nigh Impossible, and the game master may rule it out. */
  beyondTable: boolean;
}

/** `featOfStrength` of `GET /actions/:id/maneuver/modifiers?purpose=feat-of-strength&loadWeight=...`. */
export interface FeatOfStrengthListing {
  bodyWeight: number | null;
  strengthBonus: number | null;
  weightMultiplier: number;
  result?: FeatOfStrengthResult;
  /** `details.reason` of `err-feat-of-strength-invalid` the load asked for gives. */
  invalid?: string;
}

/** Query parameters of the modifiers listing for a feat of strength. */
export const featOfStrengthQuery = (choices: Partial<FeatOfStrengthChoices>): Record<string, string> => {
  const query: Record<string, string> = {};
  if (choices.loadWeight) query.loadWeight = String(choices.loadWeight);
  if (choices.mechanicalFactor) query.mechanicalFactor = String(choices.mechanicalFactor);
  if (choices.bodyWeight) query.bodyWeight = String(choices.bodyWeight);
  if (choices.strengthBonus) query.strengthBonus = String(choices.strengthBonus);
  return query;
};

/** Common mechanical factors to offer: none, dragged, lever or pulley. */
export const MECHANICAL_FACTOR_OPTIONS = [1, 0.5, 0.25, 0.1] as const;

/** `details.reason` of `err-feat-of-strength-invalid`. */
export const FEAT_OF_STRENGTH_INVALID_REASONS = ['skill', 'load', 'mechanical-factor', 'body-weight'] as const;

// ---------------------------------------------------------------------------------------------------------------
// B3-B4: adrenal moves and Fortitude
// ---------------------------------------------------------------------------------------------------------------

export const ADRENAL_KINDS = ['defense', 'focus', 'speed', 'strength'] as const;
export type AdrenalKind = (typeof ADRENAL_KINDS)[number];

/** Skill of each adrenal move. */
export const ADRENAL_SKILLS: Record<string, AdrenalKind> = {
  'adrenal-defense': 'defense',
  'adrenal-focus': 'focus',
  'adrenal-speed': 'speed',
  'adrenal-strength': 'strength',
};

/** `ActionManeuverResult.adrenal`: what an adrenal move or Fortitude gave. */
export interface AdrenalManeuverOutcome {
  kind: AdrenalKind | 'fortitude';
  rounds: number;
  fromRound?: number;
  doubled?: boolean;
  partial?: boolean;
  block?: boolean;
  blockLifted?: boolean;
  fatigue?: number;
}

/**
 * Effects of the actor round added by block B. `adrenal-defense` (level: 1 partial dodge without concentration, 2 a
 * full dodge as concentration, 4 an instantaneous full dodge, -1 no dodge), `adrenal-focus` (bonus), `adrenal-strength`
 * (sizes), `adrenal-block` (-25 to the skill in `data.skillId`) and `fortitude` (percent of the penalties taken off).
 * `adrenal-speed` existed before (spec 040). An effect with `fromRound` after the current round is still pending.
 */
export const BLOCK_B_EFFECTS = [
  'adrenal-defense',
  'adrenal-focus',
  'adrenal-speed',
  'adrenal-strength',
  'adrenal-block',
  'fortitude',
] as const;
export type BlockBEffect = (typeof BLOCK_B_EFFECTS)[number];

export const ADRENAL_BLOCK_PENALTY = -25;

/** Adrenal Defense levels. */
export const ADRENAL_DEFENSE_PARTIAL = 1;
export const ADRENAL_DEFENSE_FULL = 2;
export const ADRENAL_DEFENSE_INSTANT_FULL = 4;

/** Rounds of the benefit of a success: 1, and 1 more for every full 20 over 101. */
export const adrenalRounds = (total: number): number => (total < 101 ? 1 : 1 + Math.floor((total - 101) / 20));

/** `ActorRoundDefenseMode.adrenal`: the full dodge comes from Adrenal Defense. */
export interface ActorRoundDefenseModeBlockBFields {
  adrenal?: boolean;
}

/** Penalty source of the actor round: Fortitude, positive, offsets part of the other penalties. */
export const FORTITUDE_PENALTY_SOURCE = 'fortitude';

/** Severity step of an attack by Adrenal Strength (melee only). */
export const ADRENAL_STRENGTH_SEVERITY_STEP = 'adrenal-strength';

/** Roll modifier keys of block B in a maneuver: the Focus bonus and the -25 of a blocked skill. */
export const ADRENAL_MODIFIER_KEYS = ['adrenal-focus', 'adrenal-block'] as const;

/** Skip of an adrenal maneuver: the round of concentration it needs was declared, or is missing (only a warning). */
export const ADRENAL_CONCENTRATION_SKIP_REASONS = [
  'adrenal-concentration-declared',
  'adrenal-concentration-missing',
] as const;

/** Magical Expertise lines of the SCR (group `magical-expertise`). */
export const MAGICAL_EXPERTISE_MODIFIER_KEYS = ['grace', 'spell-trickery', 'transcendence'] as const;

/** `details.reason` of `err-adrenal-invalid`. */
export const ADRENAL_INVALID_REASONS = ['skill', 'maneuver-type', 'not-instantaneous'] as const;

// ---------------------------------------------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------------------------------------------

/** Error codes of spec 079, block B. */
export const COMBAT_BLOCK_B_ERRORS = [
  'err-skill-aid-invalid',
  'err-feat-of-strength-invalid',
  'err-adrenal-invalid',
  'err-adrenal-no-dodge',
] as const;
