/**
 * Tactical contracts of workspace spec 077, block A (Shield maneuver, concentration and grapple), shared by the MFEs
 * that read actor rounds and actions. Like `combat-talents.dto`, these are the pieces spec 077 adds to the actor round
 * and action DTOs that live in rmu-mfe-tactical.
 */

/** A modifier with its key, as the tactical API sends it in breakdowns. */
export interface CombatKeyValueModifier {
  key: string;
  value: number;
}

// ---------------------------------------------------------------------------------------------------------------
// Shield maneuver (A1)
// ---------------------------------------------------------------------------------------------------------------

/** Skips of the shield plugin: the Shield maneuver is pending, or it failed and the shield adds nothing. */
export const SHIELD_MANEUVER_SKIPS = ['shield-maneuver-pending', 'shield-maneuver-failed'] as const;
export type ShieldManeuverSkip = (typeof SHIELD_MANEUVER_SKIPS)[number];

/**
 * `ActionAttack.shieldManeuver`: the Shield maneuver the defender rolls against an attack, from the second attack its
 * shield covers. Pending while `passed` is null; `manual` when the game master decided it without a roll.
 */
export interface ShieldManeuver {
  targetId: string;
  required: boolean;
  /** Shield skill bonus of the defender. */
  skill: number;
  /** Shield DB and blocking the attack takes when it passes. */
  modifiers: CombatKeyValueModifier[];
  roll?: number | null;
  difficulty?: string | null;
  /** Penalties of the defender. */
  penalty?: number | null;
  total?: number | null;
  /** Result of the absolute maneuver table. */
  result?: string | null;
  passed?: boolean | null;
  manual?: boolean;
}

/** One Shield maneuver of `PATCH /actions/:id/attack/parry`: a roll, or `passed` alone (game master shortcut). */
export interface DeclareShieldManeuverItem {
  attackName: string;
  roll?: number;
  /** Medium when missing. */
  difficulty?: string;
  passed?: boolean;
}

/** Body of `PATCH /actions/:id/attack/parry` since spec 077: both lists are optional. */
export interface DeclareParryWithShieldDto {
  parries?: { targetId: string; parry: number }[];
  shieldManeuvers?: DeclareShieldManeuverItem[];
}

// ---------------------------------------------------------------------------------------------------------------
// Concentration (A2)
// ---------------------------------------------------------------------------------------------------------------

/** What an actor concentrates on (§8.1). */
export const CONCENTRATION_KINDS = [
  'partial-dodge',
  'partial-block',
  'held-action',
  'spell-preparation',
  'hold-position',
  'manual',
] as const;
export type ConcentrationKind = (typeof CONCENTRATION_KINDS)[number];

/** Kinds the game master sets with a `concentrating` effect; the others are derived from the round. */
export const CONCENTRATING_EFFECT_KINDS: ConcentrationKind[] = ['spell-preparation', 'hold-position', 'manual'];

/** `ActorRoundDto.concentration[]`: with any, each AP of another action counts half. */
export interface ConcentrationFocus {
  kind: ConcentrationKind;
  /** The held action, or the action of a `concentrating` effect. */
  actionId?: string;
  /** The `concentrating` effect it comes from. */
  effectId?: string;
  /** Round it started. */
  since?: number;
  note?: string;
}

/** Each AP of another action counts half while concentrating. */
export const CONCENTRATION_COST_MULTIPLIER = 2;

/** `data` of a `concentrating` effect. */
export interface ConcentratingEffectData {
  kind?: ConcentrationKind;
  since?: number;
  actionId?: string;
  note?: string;
}

/** Fields an AP ledger entry gains: spent while concentrating on something else, the action gets half of it. */
export interface ConcentratedApLedgerFields {
  concentrated?: boolean;
}

/** Why a Mental Focus maneuver is due: two foci at once, stunned while concentrating, or a focus held for long. */
export const MENTAL_FOCUS_REASONS = ['double', 'stunned', 'extended'] as const;
export type MentalFocusReason = (typeof MENTAL_FOCUS_REASONS)[number];

/** Outcome of a Mental Focus maneuver the game master marks on its alert: `failed` breaks every focus. */
export const MENTAL_FOCUS_OUTCOMES = ['passed', 'failed'] as const;
export type MentalFocusOutcome = (typeof MENTAL_FOCUS_OUTCOMES)[number];

/**
 * Alert types added by spec 077. A `mental-focus` alert carries the modifiers `reason` (text), `kind`, `actionId` and
 * `effectId` (texts, the focus held for long) and `rounds` (value).
 */
export const CONCENTRATION_ALERT_TYPES = ['mental-focus'] as const;
export type ConcentrationAlertType = (typeof CONCENTRATION_ALERT_TYPES)[number];

/** Body of `POST /actor-rounds/:id/alerts/:alertId/resolve`: the outcome of a Mental Focus maneuver. */
export interface ResolveAlertDto {
  outcome?: MentalFocusOutcome;
}

// ---------------------------------------------------------------------------------------------------------------
// Grapple (A3)
// ---------------------------------------------------------------------------------------------------------------

/** Effect statuses added by spec 077. */
export const CORE_LAW_GAP_EFFECTS = ['grappled', 'concentrating'] as const;
export type CoreLawGapEffect = (typeof CORE_LAW_GAP_EFFECTS)[number];

/**
 * `data` of a `grappled` effect: `object` for a net or anything without a grappler (no `targetActorId`), `tightened`
 * after an absolute failure of Contortions (no escape without help). `targetActorId` of the effect is the grappler and
 * `value` the percent.
 */
export interface GrappledEffectData {
  object?: boolean;
  tightened?: boolean;
}

/** Penalty source of the grapples (the sum of their percent, -100 at most). */
export const GRAPPLED_PENALTY_SOURCE = 'grappled';

/** Maneuver purpose to escape from grapples: Unarmed Strikes, Unarmed Sweeps or Contortions, percent, 2-4 AP. */
export const GRAPPLE_ESCAPE_PURPOSE = 'grapple-escape';

/** One roll of a grapple escape (`ResolveManeuverDto.grappleEscape[]`), against one grapple of the actor. */
export interface GrappleEscapeRow {
  effectId: string;
  roll: number;
  /** Medium when missing. */
  difficulty?: string;
  /** Total of the grappler's side of the contested roll (required unless the grapple is an object). */
  passiveTotal?: number;
}

/** One grapple of `ActionManeuverResult.grappleEscape[]`. */
export interface GrappleEscapeResult {
  effectId: string;
  /** The grappler; none for an object. */
  grapplerId?: string;
  roll: number;
  difficulty: string;
  passiveTotal?: number;
  total: number;
  modifiers: CombatKeyValueModifier[];
  /** Percent of the table, taken off the grapple. */
  percent: number;
  critical?: string | null;
  message?: string;
  /** Percent of the grapple left. */
  remaining: number;
  released: boolean;
  tightened?: boolean;
}

/** Feat of Strength of a grappled actor or its grappler to move away (`ActionMovementModifiers.grappleFeat`). */
export const GRAPPLE_FEATS = ['passed', 'failed'] as const;
export type GrappleFeat = (typeof GRAPPLE_FEATS)[number];

/** What changed the BMR of a movement (`ActionMovementResult.bmrMultipliers[]`). */
export interface BmrMultiplier {
  key: 'half-movement' | 'concentration';
  value: number;
}

// ---------------------------------------------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------------------------------------------

/** Error codes of block A. */
export const COMBAT_CORE_LAW_ERRORS = [
  'err-shield-maneuver-required',
  'err-shield-maneuver-not-needed',
  'err-action-double-concentration',
  'err-grapple-not-grappled',
  'err-grapple-effect-not-found',
  'err-grapple-escape-blocked',
  'err-movement-grappled',
  'err-grapple-escape-required',
] as const;
