/**
 * Tactical contracts of workspace spec 077, blocks A (Shield maneuver, concentration and grapple), B (armor by location)
 * and C (magical talents in spell casting), shared by the MFEs
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
// Armor by location (B2)
// ---------------------------------------------------------------------------------------------------------------

/**
 * Field `PATCH /actions/:id/attack/roll` gains: the unmodified critical roll (1-100), rolled with the attack. Required
 * against a target with armor by location (`defense.at` null) without a called shot; its location decides the AT, and
 * the criticals of the attack are rolled with it.
 */
export interface AttackLocationRollFields {
  criticalRoll?: number;
}

/** Fields `ActionAttack.calculated` gains: the critical roll that fixed the location (`location` is the zone). */
export interface AttackLocationCalculatedFields {
  locationRoll?: number;
}

// ---------------------------------------------------------------------------------------------------------------
// Magical talents (C)
// ---------------------------------------------------------------------------------------------------------------

/** What a magical talent changes in a spell. */
export const SPELL_ADJUSTMENT_TARGETS = ['range', 'area', 'targets', 'duration'] as const;
export type SpellAdjustmentTarget = (typeof SPELL_ADJUSTMENT_TARGETS)[number];

/** A talent of the caster that changed the spell: Spatial, Temporal or Scope Skills, Extended Reach, Lack of... */
export interface SpellAdjustmentSource {
  traitId: string;
  tier: number;
  applies: SpellAdjustmentTarget;
}

/**
 * `ActionSpell.spell.adjusted`: range, area and duration with the caster's magical talents, in the shape of
 * rmu-api-spells (`SpellRange`, `SpellArea`, `SpellDuration`); missing or null when no talent changes them.
 */
export interface ActionSpellAdjusted {
  range: Record<string, unknown> | null;
  area: Record<string, unknown> | null;
  duration: Record<string, unknown> | null;
  sources: SpellAdjustmentSource[];
}

/** Fields `ActionSpell.failure` gains: +5 per tier of Inglorious Failure, -5 of Graceful Recovery (total from 1). */
export interface SpellFailureTalentFields {
  talentModifier?: number;
}

/** Fields `ActionSpell` gains: the power points Power Recycling saved from a failed cast (null without it). */
export interface SpellRecyclingFields {
  powerPointsRecycled?: number | null;
}

/** Fields `ActionSpell.attack` gains: the targets a bolt strikes, 1 + the tier of Scope Skills (1 when missing). */
export interface SpellAttackScopeFields {
  maxTargets?: number;
}

/**
 * Field `PATCH /actions/:id/attack/prepare` gains for a bolt with several targets: the OB of each attack, in order
 * (whole numbers from 0, adding up to the OB of the bolt at most); equal parts when left out.
 */
export interface PrepareAttackObSplitFields {
  obSplit?: number[];
}

/** Breakdown group of the magical talents of the SCR and of Iron Will in a resistance roll. */
export const SPELL_TALENT_GROUP = 'talent';

/** Resistance roll entry of Iron Will against a mental attack. */
export const IRON_WILL_RR_KEY = 'iron-will';

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

/** Error codes of blocks B and C. */
export const COMBAT_CORE_LAW_BC_ERRORS = [
  'err-attack-location-roll-required',
  'err-critical-roll-location-fixed',
  'err-spell-ob-split-invalid',
  'err-spell-bolt-single-target',
] as const;
