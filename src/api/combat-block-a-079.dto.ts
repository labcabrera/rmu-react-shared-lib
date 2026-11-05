/**
 * Tactical contracts of workspace spec 079, block A (Core Law §8.1, §9.5-9.8, Table 8-1), shared by the MFEs that read
 * actor rounds and actions. As `combat-core-law.dto`, these are the pieces the spec adds to the actor round and action
 * DTOs that live in rmu-mfe-tactical.
 */

// ---------------------------------------------------------------------------------------------------------------
// A1-A2: Reverse Strike and parry
// ---------------------------------------------------------------------------------------------------------------

/** Roll modifier keys added by block A: the defender's Reverse Strike against the positional bonus, and the parry. */
export const BLOCK_A_MODIFIER_KEYS = ['positional-target-skill', 'parry-positional'] as const;

/** Skip of the `positional-target` plugin: a surprised target cannot use its Reverse Strike. */
export const REVERSE_STRIKE_SURPRISED_SKIP = 'reverse-strike-surprised';

/** `ActionParry.positional`: the attacker is on the defender's flank (-30) or rear (-70), offset by Reverse Strike. */
export interface ParryPositional {
  position: 'flank' | 'rear';
  penalty: number;
  reverseStrike: number;
}

/**
 * `ActionParry.parryManeuver`: from the second foe parried in the round, an absolute Combat Training maneuver whose
 * result is entered. Only a success or better lets the parry count; below it the parry is 0.
 */
export interface ParryManeuver {
  required: boolean;
  /** Foes the defender already parried in the round. */
  foes: number;
  result: string | null;
  passed: boolean | null;
}

/** Fields `ActionParry` gains. */
export interface ActionParryBlockAFields {
  positional?: ParryPositional | null;
  parryManeuver?: ParryManeuver | null;
}

/** Results an absolute maneuver can give, worst first. */
export const ABSOLUTE_MANEUVER_RESULTS = [
  'absolute-failure',
  'failure',
  'partial-success',
  'success',
  'absolute-success',
] as const;
export type AbsoluteResultKey = (typeof ABSOLUTE_MANEUVER_RESULTS)[number];

/** Results of the parry maneuver that let the parry count. */
export const PARRY_MANEUVER_PASSED_RESULTS: AbsoluteResultKey[] = ['success', 'absolute-success'];

/** One parry of `PATCH /actions/:id/attack/parry` with the result of its maneuver, when it needs one. */
export interface DeclareParryItemBlockA {
  parryId: string;
  parry: number;
  maneuverResult?: AbsoluteResultKey;
}

/** DB a parry against a flank or rear attacker loses: the positional penalty less Reverse Strike, at most the parry. */
export const parryPositionalReduction = (parryDb: number, positional: ParryPositional | null | undefined): number => {
  if (!positional || parryDb <= 0) return 0;
  return Math.min(parryDb, Math.max(0, -positional.penalty - positional.reverseStrike));
};

// ---------------------------------------------------------------------------------------------------------------
// A3: total penalty thresholds and stun immunity
// ---------------------------------------------------------------------------------------------------------------

/** `ActorRound.stunImmune` (critical code @ of an NPC): a stun is a flat -25 for 1 round that does not stack. */
export interface ActorRoundBlockAFields {
  stunImmune?: boolean;
}

export const STUN_IMMUNE_PENALTY = -25;

/** Total penalties (hits lost included) from which effort asks for an endurance roll, the actor is dying, or dies. */
export const PENALTY_EXERTION_THRESHOLD = -100;
export const PENALTY_DYING_THRESHOLD = -200;
export const PENALTY_DEATH_THRESHOLD = -300;

/** `reason` modifier of an `endurance` alert raised by the total penalties (none for the accumulated fatigue). */
export const PENALTY_ENDURANCE_REASONS = ['penalty-exertion', 'penalty-dying'] as const;
export type PenaltyEnduranceReason = (typeof PENALTY_ENDURANCE_REASONS)[number];

/**
 * Alert types added by block A. `death-threshold` has the modifiers `total` and `round` and is resolved with the outcome
 * `confirmed` (the actor dies) or without one (dismissed). `knocked-back` has `feet`, `severityCap` and `criticalKey`;
 * it is resolved by hand, or by a hazard with `knockedBackAlertId`.
 */
export const BLOCK_A_ALERT_TYPES = ['death-threshold', 'knocked-back', 'stray-shot'] as const;
export type BlockAAlertType = (typeof BLOCK_A_ALERT_TYPES)[number];

/** Outcomes of `POST /actor-rounds/:id/alerts/:alertId/resolve` since spec 079. */
export const ALERT_OUTCOMES = ['passed', 'failed', 'confirmed'] as const;
export type AlertOutcome = (typeof ALERT_OUTCOMES)[number];

// ---------------------------------------------------------------------------------------------------------------
// A4: knock-back
// ---------------------------------------------------------------------------------------------------------------

/** Field `ResolveHazardDto` gains: the `knocked-back` alert it resolves; its severity caps the critical. */
export interface ResolveHazardBlockAFields {
  knockedBackAlertId?: string | null;
}

/** Fields `ActorRoundHazard` gains. */
export interface ActorRoundHazardBlockAFields {
  severityCap?: string | null;
  knockedBackAlertId?: string | null;
}

/** Skills the game master usually asks for to catch oneself after a knock-back (difficulty of his choice). */
export const KNOCK_BACK_RECOVERY_SKILLS = ['acrobatics', 'running'] as const;

// ---------------------------------------------------------------------------------------------------------------
// A5: fixed costs of Table 8-1
// ---------------------------------------------------------------------------------------------------------------

/** Subtypes of an `other` action with a fixed AP cost. */
export const OTHER_ACTION_KINDS = [
  'shift-item',
  'pick-up',
  'drop-prone',
  'mount-dismount',
  'string-bow',
  'load-crossbow',
  'pick-lock',
  'disarm-trap',
] as const;
export type OtherActionKind = (typeof OTHER_ACTION_KINDS)[number];

/** AP of each subtype (a light or hand crossbow for `load-crossbow`). */
export const OTHER_ACTION_AP: Record<OtherActionKind, number> = {
  'shift-item': 1,
  'pick-up': 3,
  'drop-prone': 2,
  'mount-dismount': 4,
  'string-bow': 6,
  'load-crossbow': 6,
  'pick-lock': 20,
  'disarm-trap': 20,
};

/** AP to load a heavy crossbow: the server tells it by `heavy` in the attack, item type or item name. */
export const HEAVY_CROSSBOW_LOAD_AP = 14;

/** Subtypes that name the attack of their weapon (`attackName`); required for `load-crossbow`. */
export const OTHER_ACTION_WEAPON_KINDS: OtherActionKind[] = ['string-bow', 'load-crossbow'];

/** `Action.otherAction`: the subtype, the weapon's attack and the AP it takes (more than 4: it lasts several rounds). */
export interface ActionOther {
  kind: OtherActionKind;
  attackName: string | null;
  ap: number;
}

/** Field `CreateActionDto` gains for `actionType: 'other'`. */
export interface CreateActionOtherFields {
  otherAction?: { kind: OtherActionKind; attackName?: string };
}

/** AP of a subtype; `heavyCrossbow` for loading a heavy crossbow. */
export const otherActionAp = (kind: OtherActionKind, heavyCrossbow = false): number =>
  kind === 'load-crossbow' && heavyCrossbow ? HEAVY_CROSSBOW_LOAD_AP : OTHER_ACTION_AP[kind];

/** `details.reason` of `err-other-action-invalid`. */
export const OTHER_ACTION_INVALID_REASONS = [
  'not-other',
  'unknown-kind',
  'free',
  'attack-not-found',
  'not-crossbow',
] as const;

// ---------------------------------------------------------------------------------------------------------------
// A6: firing into melee (§9.7)
// ---------------------------------------------------------------------------------------------------------------

/**
 * Partial hard cover the combatants in the way give to the target of a ranged attack (`melee-cover`), unless the game
 * master declared the cover (the plugin is then skipped with `cover-declared`).
 */
export const MELEE_COVER_DEFAULT = -40;
export const MELEE_COVER_DECLARED_SKIP = 'cover-declared';

/**
 * `stray-shot` alert of the attacker: modifiers `actionId`, `attackName`, `targetActorId` (chosen at random), one
 * `candidate` per combatant in the way and `round`. Confirmed by declaring a forced `stray-shot` ranged attack with its
 * `alertId`; dismissed with the resolve endpoint.
 */
export const STRAY_SHOT_ALERT_TYPE = 'stray-shot';

/** `forced` of the second attack of a stray shot. */
export interface StrayShotForcedRequest {
  reason: 'stray-shot';
  note?: string;
  alertId: string;
}

/** `Action.strayShot`: the stray shot an attack forced as `stray-shot` comes from; it is prepared at OB 0, without cover. */
export interface ActionStrayShot {
  alertId: string;
  triggerActionId: string;
  attackName: string;
  targetActorId: string;
}

/** Data of a `stray-shot` alert, read from its modifiers. */
export interface StrayShotAlertData {
  actionId: string | null;
  attackName: string | null;
  targetActorId: string | null;
  candidates: string[];
}

/** The data of a `stray-shot` alert from its modifiers. */
export const strayShotAlertData = (
  modifiers: { key: string; modifier?: string | null }[] | null | undefined
): StrayShotAlertData => {
  const text = (key: string) => modifiers?.find((m) => m.key === key)?.modifier ?? null;
  return {
    actionId: text('actionId'),
    attackName: text('attackName'),
    targetActorId: text('targetActorId'),
    candidates: (modifiers ?? []).filter((m) => m.key === 'candidate' && !!m.modifier).map((m) => m.modifier as string),
  };
};

// ---------------------------------------------------------------------------------------------------------------
// A7: disarm (Table 9-7a) and subdual (Table 9-7e)
// ---------------------------------------------------------------------------------------------------------------

export const ATTACK_MODES = ['normal', 'disarm', 'subdual'] as const;
export type AttackMode = (typeof ATTACK_MODES)[number];

/** Fields the attack modifiers of `PATCH /actions/:id/attack/prepare` (and of the attack DTO) gain. */
export interface AttackModifiersBlockAFields {
  attackMode?: AttackMode;
  /** Disarm: total of the defender's roll, required. */
  disarmDefenseRoll?: number | null;
  /** Disarm: the foe wields a two-handed weapon (-25). */
  disarmTwoHanded?: boolean;
  /** Subdual: skill bonus the game master enters (not a Core Law skill). */
  subdualBonus?: number | null;
  /** Subdual: unfamiliar anatomy (-50). */
  unfamiliarAnatomy?: boolean;
  /** Ranged attack: other combatants engaged with the target. */
  meleeCoverActorIds?: string[];
}

export const DISARM_TWO_HANDED_PENALTY = -25;
export const SUBDUAL_UNFAMILIAR_ANATOMY_PENALTY = -50;
export const SUBDUAL_MAX_SEVERITY = 'E';
export const SUBDUAL_CRITICAL_TYPE = 'subdual';

/** Bands of Table 9-7a. */
export const DISARM_RESULTS = ['absolute-failure', 'failure', 'partial', 'success', 'absolute-success'] as const;
export type DisarmResult = (typeof DISARM_RESULTS)[number];

/** `ActionAttack.disarm`: the band, the disarm total, the total of the normal attack of a partial, and an unmodified 66. */
export interface ActionAttackDisarm {
  result: DisarmResult;
  total: number;
  attackTotal: number | null;
  unusual: boolean;
}

/** `ActionAttackResults.subdualAdjustment`: the hits and critical of the table before the subdual. */
export interface SubdualAdjustment {
  baseDamage: number;
  criticalType: string | null;
  criticalSeverity: string | null;
}

/** The band of Table 9-7a of a disarm total. */
export const disarmResult = (total: number): DisarmResult => {
  if (total < 1) return 'absolute-failure';
  if (total <= 75) return 'failure';
  if (total <= 100) return 'partial';
  if (total <= 175) return 'success';
  return 'absolute-success';
};

/** Modifier of the defender's roll to a disarm: 100 less its total (a bonus below 100, a penalty above). */
export const disarmDefenseModifier = (defenseRoll: number): number => 100 - defenseRoll;

/** `GET /attack-tables/:id/modifiers` of rmu-api-attack-tables: null when the maneuver does not apply to the table. */
export interface AttackTableModifiers {
  id: string;
  disarm: { melee: number; ranged: number | null } | null;
  subdual: { melee: number; ranged: number | null } | null;
}

/** Roll modifier keys added by A6-A7, all with a rule reference. */
export const SPECIAL_MANEUVER_MODIFIER_KEYS = [
  'melee-cover',
  'disarm',
  'disarm-two-handed',
  'disarm-skill',
  'disarm-defense',
  'subdual',
  'subdual-anatomy',
  'subdual-skill',
] as const;

// ---------------------------------------------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------------------------------------------

/** Error codes of spec 079, block A. */
export const COMBAT_BLOCK_A_ERRORS = [
  'err-parry-maneuver-required',
  'err-parry-maneuver-not-needed',
  'err-other-action-invalid',
  'err-attack-mode-invalid',
  'err-disarm-defense-roll-required',
  'err-melee-cover-invalid',
  'err-stray-shot-invalid',
  'err-stray-shot-not-available',
] as const;
