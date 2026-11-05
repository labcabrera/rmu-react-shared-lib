/**
 * Tactical contracts of workspace spec 076 (combat talents, senses and light), shared by the MFEs that read actor
 * rounds and actions. The actor round and action DTOs themselves live in rmu-mfe-tactical: these are the pieces it
 * adds to them.
 */
import { OpenEndedThresholds } from '../rolls/roll.types';

// ---------------------------------------------------------------------------------------------------------------
// Roll profile (§2.8)
// ---------------------------------------------------------------------------------------------------------------

/** Absolute Ease of a skill category: its tier and whether the actor has the Absolute Disaster flaw. */
export interface AbsoluteEaseEntry {
  categoryId: string;
  /** 1: absolute success from 151, 2: from 126, 3: always. */
  tier: number;
  /** Absolute Disaster: failures up to 25 (1), 50 (2) or always (3) are absolute. */
  disaster: boolean;
}

/**
 * How the talents of an actor change its rolls (`ActorRoundDto.rollProfile`), computed by the API from its traits.
 * `highFrom` and `lowTo` are the open-ended thresholds: pass the profile to `RollField` as `openEnded`.
 */
export interface ActorRollProfile extends OpenEndedThresholds {
  /** Unusual Luck: a natural 66 of an unopposed absolute maneuver is a success. */
  unusualLuck: boolean;
  /** Terrible Luck: a natural 01 raises a `terrible-luck` alert. */
  terribleLuck: boolean;
  /** Spasm: a natural 66 gives a spasm of d10 rounds. */
  spasm: boolean;
  absoluteEase: AbsoluteEaseEntry[];
}

/** Talent that changed the result of a maneuver table (`ActionManeuverResult.rollTalent`). */
export type ManeuverRollTalent = 'unusual-luck' | 'absolute-ease' | 'absolute-disaster';

// ---------------------------------------------------------------------------------------------------------------
// Alerts and reactions (§2.1, §2.2)
// ---------------------------------------------------------------------------------------------------------------

/** Alert types added by spec 076 to the actor round alerts. */
export const COMBAT_TALENT_ALERT_TYPES = ['reaction-available', 'terrible-luck'] as const;
export type CombatTalentAlertType = (typeof COMBAT_TALENT_ALERT_TYPES)[number];

/** Status of an actor round alert: `expired` is a `reaction-available` alert not taken before its phase ended. */
export type ActorRoundAlertStatus = 'pending' | 'resolved' | 'expired';

/** Talents that attack out of turn as a reaction. */
export const REACTION_TRAIT_IDS = ['riposte', 'opportunistic-strike'] as const;
export type ReactionTraitId = (typeof REACTION_TRAIT_IDS)[number];

/**
 * `reaction` of a `reaction-available` alert: the actor can attack `targetActorId` at once, 0 AP, because of the
 * action `triggerActionId`. It expires when the game leaves `phase`.
 */
export interface ReactionAlertData {
  traitId: ReactionTraitId;
  triggerActionId: string;
  targetActorId: string;
  /** Fixed OB of the attack (Riposte: 50 less the attacker's total roll; it can be negative). Null: the actor's OB. */
  obOverride: number | null;
  round: number;
  phase: string;
}

/** Why an action is resolved out of its turn; `reaction` is new in spec 076 (0 AP, no AP penalty). */
export type ForceReason = 'withdrawal' | 'pass-through' | 'effect' | 'gm' | 'reaction';
export const FORCE_REASONS: ForceReason[] = ['withdrawal', 'pass-through', 'effect', 'gm', 'reaction'];

/** `forced` of a new attack declared as a reaction: always from its `reaction-available` alert. */
export interface ReactionForcedRequest {
  reason: 'reaction';
  note?: string;
  alertId: string;
}

/** `ActionDto.reaction`: the reaction of an attack forced as `reaction`. */
export interface ActionReaction {
  traitId: string;
  triggerActionId: string;
  obOverride: number | null;
  /** Null when forced by the game master. */
  alertId: string | null;
}

/** `reaction` of an attack of an action (`ActionAttackDto.reaction`). */
export interface ActionAttackReaction {
  traitId: string;
  triggerActionId: string;
  obOverride: number | null;
}

// ---------------------------------------------------------------------------------------------------------------
// Actions: draw and load, aim (§2.3, §2.7)
// ---------------------------------------------------------------------------------------------------------------

/** `drawAndLoad` of a `draw_and_load` action: the weapon (Quickdraw makes it 0 AP). */
export interface ActionDrawAndLoad {
  itemId: string | null;
}

/** `aim` of an `aim` action (Sharpshooter): a full round aiming a ranged weapon at a foe. */
export interface ActionAim {
  targetActorId: string;
  itemId: string;
}

// ---------------------------------------------------------------------------------------------------------------
// Effects (§2.4)
// ---------------------------------------------------------------------------------------------------------------

/**
 * Effect statuses added by spec 076: `ob_bonus` / `db_bonus` (value > 0, they add up), `battle-cry` (+10 OB and DB for
 * the whole combat), `aiming` (value, `targetActorId`, `data.itemId`), `critical-reroll` (`targetActorId`,
 * `data.kind`), `precision` (value added to the critical, `targetActorId`, `data.obPenalty`) and `spasm` (rounds, a
 * stun of -50, 2 AP less and 1 hit per round).
 */
export const COMBAT_TALENT_EFFECTS = [
  'ob_bonus',
  'db_bonus',
  'battle-cry',
  'aiming',
  'critical-reroll',
  'precision',
  'spasm',
] as const;
export type CombatTalentEffect = (typeof COMBAT_TALENT_EFFECTS)[number];

/** Who rolls a critical again: the attacker its critical (`offense`) or the defender the one it takes (`defense`). */
export type CriticalRerollKind = 'offense' | 'defense';

/** Fields an actor round effect gains in spec 076. */
export interface CombatTalentEffectFields {
  /** Foe of `aiming`, `critical-reroll` or `precision`. */
  targetActorId?: string;
  /** `{ itemId }` for `aiming`, `{ kind }` for `critical-reroll`, `{ obPenalty }` for `precision`. */
  data?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------------------------------------------
// Criticals (§2.5)
// ---------------------------------------------------------------------------------------------------------------

/** Fields a critical of an attack gains in spec 076: a critical rolled again keeps its first roll. */
export interface CriticalRerollFields {
  originalRoll?: number | null;
  rerolledBy?: CriticalRerollKind;
}

/** Fields the critical roll update gains: `reroll` rolls it again with a `critical-reroll` effect. */
export interface UpdateCriticalRollRerollFields {
  reroll?: boolean;
  /** The die of the closed d100 roll; when sent, it must be the roll. */
  dice?: number[];
}

// ---------------------------------------------------------------------------------------------------------------
// Maneuvers with a purpose (§2.6)
// ---------------------------------------------------------------------------------------------------------------

/** Maneuvers of the combat talents; the frenzy purposes of spec 040 stay in the MFE. */
export const COMBAT_TALENT_PURPOSES = ['battle-cry', 'sense-weakness', 'study-offense', 'precision'] as const;
export type CombatTalentPurpose = (typeof COMBAT_TALENT_PURPOSES)[number];

/** Trait each combat talent maneuver needs (`err-maneuver-purpose-trait-required` otherwise). */
export const COMBAT_TALENT_PURPOSE_TRAITS: Record<CombatTalentPurpose, string> = {
  'battle-cry': 'battle-cry',
  'sense-weakness': 'sense-weakness',
  'study-offense': 'study-offense',
  precision: 'precision',
};

/** Where a Precision attacker stands: -50 rear, -70 flank, -100 front. */
export const PRECISION_POSITIONS = ['rear', 'flank', 'front'] as const;
export type PrecisionPosition = (typeof PRECISION_POSITIONS)[number];

/** Fields of a maneuver (request and response) for the combat talent purposes and the luck talents. */
export interface CombatTalentManeuverFields {
  /** Sense Weakness, Study Offense, Precision: the foe. */
  foeActorId?: string;
  /** Battle Cry: level of the highest level foe, -2 per level. */
  foeLevel?: number;
  /** Precision. */
  position?: PrecisionPosition;
  /** Precision: OB given up to the attack, which makes the maneuver as much easier. */
  obPenalty?: number;
}

/** Fields of a roll update for Spasm: the rounds (d10) of the spasm of a natural 66; the API rolls them when missing. */
export interface SpasmRoundsField {
  spasmRounds?: number;
}

// ---------------------------------------------------------------------------------------------------------------
// Senses and light (§3)
// ---------------------------------------------------------------------------------------------------------------

/** Senses of a Perception or Tracking maneuver; `extra` needs the Extra Sense talent. */
export const SENSES = ['vision', 'hearing', 'smell', 'taste', 'touch', 'extra'] as const;
export type Sense = (typeof SENSES)[number];

/** The maneuver cannot be made without the sense (`required`), or the sense only helps it (`helpful`). */
export const SENSE_USAGES = ['required', 'helpful'] as const;
export type SenseUsage = (typeof SENSE_USAGES)[number];

/** Situations the game master marks for the sense talents. */
export const SENSE_SELECTIONS = ['locate-sound', 'warm-target', 'hidden-target', 'within-darkvision'] as const;
export type SenseSelection = (typeof SENSE_SELECTIONS)[number];

/** Skills a sense can be chosen for (`err-maneuver-sense-not-allowed` for the others). */
export const SENSE_SKILL_IDS = ['perception', 'tracking'];

export const DEFAULT_SENSE: Sense = 'vision';
export const DEFAULT_SENSE_USAGE: SenseUsage = 'required';
/** Missing Sense where the sense only helps: -20 by default, -50 to -20. */
export const MISSING_SENSE_HELPFUL_DEFAULT = -20;
export const MISSING_SENSE_HELPFUL_MIN = -50;
/** Heatsense: +20 by default, 0 to 20. */
export const HEATSENSE_MAX = 20;

/** Fields of a maneuver resolution for the senses (Perception and Tracking). */
export interface ManeuverSenseChoices {
  sense?: Sense;
  senseUsage?: SenseUsage;
  senseSelections?: SenseSelection[];
  missingSenseModifier?: number;
  heatsenseModifier?: number;
}

/** A modifier of a sense talent of the actor in the maneuver listing, with the conditions it applies in. */
export interface ManeuverSenseModifier {
  /** Trait id. */
  key: string;
  /** The value, or the default one when the game master may change it (`min` / `max`). */
  value: number;
  rule: string;
  params: Record<string, number | string>;
  /** Sense it applies to; any when missing. */
  sense?: Sense;
  /** Usage it applies to; any when missing. */
  usage?: SenseUsage;
  /** Selection it needs. */
  selection?: SenseSelection;
  min?: number;
  max?: number;
}

/** `senses` group of the maneuver listing (Perception and Tracking only). */
export interface ManeuverSenses {
  default: Sense;
  /** Senses the actor can use (`extra` with Extra Sense). */
  options: Sense[];
  defaultUsage: SenseUsage;
  usages: SenseUsage[];
  /** Selections that change something for the actor. */
  selections: SenseSelection[];
  modifiers: ManeuverSenseModifier[];
}

/** Light levels of Table 15-7, as the tactical API names them. */
export const LIGHT_TYPES = [
  'no_shadows',
  'light_shadows',
  'medium_shadows',
  'heavy_shadows',
  'dark',
  'extremely_dark',
  'pitch_black',
] as const;
export type LightType = (typeof LIGHT_TYPES)[number];

/** A light option of the maneuver listing, with the Light Sensitivity penalty of the actor in that light. */
export interface ManeuverLightOption {
  key: string;
  value: number;
  sensitivity?: number;
}

/**
 * Sense talents of the Character Companion catalog that the rules apply in the roll of a Perception or Tracking
 * maneuver (situational: they are not in the skill total of the sheet, decision C8).
 */
export const SENSE_TRAIT_IDS = [
  'acute-hearing',
  'acute-smell',
  'acute-taste',
  'acute-touch',
  'acute-vision',
  'poor-hearing',
  'poor-smell',
  'poor-taste',
  'poor-touch',
  'poor-vision',
  'missing-sense-hearing',
  'missing-sense-smell',
  'missing-sense-taste',
  'missing-sense-touch',
  'missing-sense-vision',
  'extra-sense',
  'hearing-cat',
  'hearing-dog',
  'hearing-hare',
  'sight-gecko',
  'sight-eagle',
  'sight-hawk',
  'heatsense',
  'tetrachromatic-vision',
  'nightvision',
  'darkvision',
  'light-sensitivity',
] as const;
export type SenseTraitId = (typeof SENSE_TRAIT_IDS)[number];

export const isSenseTrait = (traitId: string): traitId is SenseTraitId =>
  (SENSE_TRAIT_IDS as readonly string[]).includes(traitId);
