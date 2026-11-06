/**
 * Environment contracts of workspace spec 079, block C: extreme temperatures (C3, §15.3), drowning and suffocation (C4,
 * §15.2), and fog, light sources and magical darkness (C5, §15.7). Only numbers of the tables: no rule text.
 */

import type { BreathHoldingLimit } from './talents-079.dto';
import type { LightType } from './combat-talents.dto';

// ---------------------------------------------------------------------------------------------------------------
// C3: extreme temperatures
// ---------------------------------------------------------------------------------------------------------------

/** Cold (critical `O`), heat (`H`) or steam (its own table, `steam`; heat for the elemental talents). */
export const TEMPERATURE_KINDS = ['cold', 'heat', 'steam'] as const;
export type TemperatureKind = (typeof TEMPERATURE_KINDS)[number];

export const TEMPERATURE_CRITICAL_TYPES: Record<TemperatureKind, string> = { cold: 'O', heat: 'H', steam: 'steam' };

/** Highest temperature (°C) that is extreme cold and lowest that is extreme heat (Table 15-3). */
export const EXTREME_COLD_MAX = -50;
export const EXTREME_HEAT_MIN = 101;

/** Severities a game master may give instead of a temperature. */
export const TEMPERATURE_SEVERITIES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;

const COLD_BOUNDS: [number, string][] = [
  [-50, 'A'],
  [-76, 'B'],
  [-101, 'C'],
  [-126, 'D'],
  [-151, 'E'],
  [-176, 'F'],
  [-201, 'G'],
  [-226, 'H'],
];
const HEAT_BOUNDS: [number, string][] = [
  [100, 'A'],
  [150, 'B'],
  [250, 'C'],
  [400, 'D'],
  [550, 'E'],
];

/**
 * Table 15-3 in °C, as the tactical API reads it (for previews): cold from -50 down to I below -250, heat from 101 up to
 * E at 800 and one more per 300 above (capped at J). Null when it is not extreme.
 */
export const temperatureSeverity = (
  celsius: number | null | undefined
): { kind: 'cold' | 'heat'; severity: string } | null => {
  if (celsius === null || celsius === undefined || !Number.isFinite(celsius)) return null;
  if (celsius <= EXTREME_COLD_MAX) {
    if (celsius < -250) return { kind: 'cold', severity: 'I' };
    let severity = 'A';
    for (const [bound, value] of COLD_BOUNDS) if (celsius <= bound) severity = value;
    return { kind: 'cold', severity };
  }
  if (celsius > 100) {
    if (celsius > 800) {
      const index = Math.min(4 + Math.ceil((celsius - 800) / 300), TEMPERATURE_SEVERITIES.length - 1);
      return { kind: 'heat', severity: TEMPERATURE_SEVERITIES[index] };
    }
    let severity = 'A';
    for (const [bound, value] of HEAT_BOUNDS) if (celsius > bound) severity = value;
    return { kind: 'heat', severity };
  }
  return null;
};

/**
 * `GameEnvironment.extremeTemperature` of a tactical game: every upkeep raises the critical (origin `environment`) of
 * each actor not protected. The answers add the table and severity it gives.
 */
export interface GameExtremeTemperature {
  kind: TemperatureKind;
  /** °C, through Table 15-3. */
  temperature?: number | null;
  /** A severity given instead of the temperature. */
  severity?: string | null;
  /** Answers only. */
  criticalType?: string;
  criticalSeverity?: string;
}

/** Fields `TacticalGameEnvironment` gains. In a PATCH, left out keeps them and null clears them. */
export interface GameEnvironment079Fields {
  fog?: FogLevel | null;
  extremeTemperature?: GameExtremeTemperature | null;
}

/** Hazard kind of an extreme temperature (`POST /v1/actor-rounds/:id/hazards`): a critical without an attack roll. */
export const EXTREME_TEMPERATURE_HAZARD = 'extreme-temperature';

/** Body of a hazard of an extreme temperature: its kind and its °C or a severity; the criticals not rolled become alerts. */
export interface ResolveTemperatureHazardDto {
  kind: typeof EXTREME_TEMPERATURE_HAZARD;
  temperatureKind?: TemperatureKind | null;
  temperature?: number | null;
  severity?: string | null;
  criticalRolls?: number[] | null;
  note?: string | null;
}

/** The temperature of a resolved hazard (`ActorRoundHazard.temperature`); null for falls. */
export interface HazardTemperature {
  kind: TemperatureKind;
  celsius: number | null;
  criticalType: string;
  severitySource: 'table' | 'given';
}

/** Fields `ActorRoundHazard` gains: its temperature (its `attackTable` is null then). */
export interface ActorRoundHazard079Fields {
  temperature?: HazardTemperature | null;
}

/** Origin of the critical alerts of the extreme temperature of the environment. */
export const ENVIRONMENT_CRITICAL_ORIGIN = 'environment';

/** `PATCH /v1/actor-rounds/:id/environment-protection` (game master). */
export interface EnvironmentProtectionDto {
  protected: boolean;
}

// ---------------------------------------------------------------------------------------------------------------
// C4: drowning and suffocation
// ---------------------------------------------------------------------------------------------------------------

/** Rounds a prepared actor holds its breath before its Constitution bonus. */
export const BREATH_PREPARED_BASE_ROUNDS = 12;

/** Limit of the held breath: 12 + Co bonus prepared, the bonus alone unprepared, at least 1. */
export const breathLimitRounds = (prepared: boolean, constitutionBonus: number): number =>
  Math.max(1, (prepared ? BREATH_PREPARED_BASE_ROUNDS : 0) + Math.trunc(constitutionBonus || 0));

/** Difficulties of the checks past the limit, from the first one. */
export const BREATH_CHECK_DIFFICULTIES = ['e', 'l', 'm', 'h', 'vh', 'xh', 'sf', 'a', 'ni'] as const;

/** Bonus of an active Adrenal Focus to the checks. */
export const BREATH_ADRENAL_FOCUS_BONUS = 25;

/** Alert of a check: modifiers `difficulty`, `heldRounds`, `limitRounds`, `round` and `adrenal-focus`; outcome passed/failed. */
export const BREATH_CHECK_ALERT = 'breath-check';

/** Effect of a failed check: 1d10 hits per upkeep (`data.underwater`: it inhaled water, stunned -50). */
export const SUFFOCATING_EFFECT = 'suffocating';

/** Hits log kind of a round of suffocation. */
export const SUFFOCATION_HP_KIND = 'suffocation';

/** The breath an actor holds (`ActorRound.breath`). */
export interface ActorRoundBreath {
  sinceRound: number;
  prepared: boolean;
  underwater: boolean;
  constitutionBonus: number;
  constitutionSource: 'sheet' | 'request' | 'none';
  limitRounds: number;
  /** Rounds held at the end of this round. */
  heldRounds: number;
  /** Round of the failed check; null while it holds it. */
  failedRound: number | null;
  note: string | null;
  /** Workspace spec 079, D5: the limit of Breath Holding, used when longer than the base one; null without it. */
  breathHolding?: BreathHoldingLimit | null;
}

/** Fields `ActorRound` gains. */
export interface ActorRoundEnvironmentFields {
  breath?: ActorRoundBreath | null;
  protectedFromEnvironment?: boolean;
}

/** `POST /v1/actor-rounds/:id/breath` (game master); `DELETE` the same path to breathe again. */
export interface StartBreathDto {
  /** True by default. */
  prepared?: boolean;
  underwater?: boolean;
  /** The one of the sheet by default; give it for an NPC. */
  constitutionBonus?: number;
  note?: string | null;
  /** Workspace spec 079, D5 (Breath Holding): the actor stays inactive, or meditates (a successful Meditation). */
  inactive?: boolean;
  meditation?: boolean;
}

/** Rounds left before the checks start (0: they are due). */
export const breathRoundsLeft = (breath: Pick<ActorRoundBreath, 'heldRounds' | 'limitRounds'>): number =>
  Math.max(0, breath.limitRounds - breath.heldRounds);

// ---------------------------------------------------------------------------------------------------------------
// C5: fog, light sources and darkness
// ---------------------------------------------------------------------------------------------------------------

/** Fog of Table 15-7, from light fog or mist to extreme fog. */
export const FOG_LEVELS = ['light', 'medium', 'heavy', 'extreme'] as const;
export type FogLevel = (typeof FOG_LEVELS)[number];

/** Visibility (feet) and modifier to visual Perception and Tracking (vision talents do not reduce it). */
export const FOG_TABLE: Record<FogLevel, { visibilityFeet: number; perception: number }> = {
  light: { visibilityFeet: 300, perception: -15 },
  medium: { visibilityFeet: 100, perception: -25 },
  heavy: { visibilityFeet: 50, perception: -50 },
  extreme: { visibilityFeet: 10, perception: -75 },
};

/** Hearing a sound beyond the visual range in fog (sense selection `beyond-visual-range`). */
export const FOG_BEYOND_VISUAL_RANGE_HEARING = -20;
export const BEYOND_VISUAL_RANGE_SELECTION = 'beyond-visual-range';

/** `fog` of the maneuver listing (Perception and Tracking in a game with fog). */
export interface ManeuverFogListing {
  level: FogLevel;
  visibilityFeet: number;
  vision: number;
  hearingBeyondRange: number;
}

/** Breakdown keys of the fog. */
export const FOG_MODIFIER_KEYS = ['fog', 'fog-beyond-visual-range'] as const;

/** Light sources of §15.7 and the light they give within 10'. */
export const LIGHT_SOURCES = ['candle', 'torch', 'lantern', 'bonfire'] as const;
export type LightSource = (typeof LIGHT_SOURCES)[number];

export const LIGHT_SOURCE_LEVEL: Record<LightSource, LightType> = {
  candle: 'heavy_shadows',
  torch: 'medium_shadows',
  lantern: 'light_shadows',
  bonfire: 'light_shadows',
};

/** Darkness levels added by the distance to the source: up to 10', 30', 100' and 300'. */
export const LIGHT_DISTANCE_STEPS: { maxFeet: number; steps: number }[] = [
  { maxFeet: 10, steps: 0 },
  { maxFeet: 30, steps: 1 },
  { maxFeet: 100, steps: 2 },
  { maxFeet: 300, steps: 3 },
];

const LIGHT_ORDER: LightType[] = [
  'no_shadows',
  'light_shadows',
  'medium_shadows',
  'heavy_shadows',
  'dark',
  'extremely_dark',
  'pitch_black',
];

/**
 * Light a source gives at a distance (§15.7): its level within 10', one level darker to 30', two to 100', three to 300'.
 * Beyond 300' the source gives nothing: the ambient light (null without one). With an ambient light, the brighter of
 * the two. A negative distance is null.
 */
export const lightAtDistance = (source: LightSource, feet: number, ambient?: LightType | null): LightType | null => {
  if (!Number.isFinite(feet) || feet < 0) return null;
  const step = LIGHT_DISTANCE_STEPS.find((each) => feet <= each.maxFeet);
  if (!step) return ambient ?? null;
  const index = Math.min(LIGHT_ORDER.indexOf(LIGHT_SOURCE_LEVEL[source]) + step.steps, LIGHT_ORDER.length - 1);
  const fromSource = LIGHT_ORDER[index];
  if (!ambient) return fromSource;
  return LIGHT_ORDER.indexOf(ambient) < index ? ambient : fromSource;
};

/** Error codes of block C in tactical. */
export const ENVIRONMENT_ERROR_CODES = [
  'err-temperature-not-extreme',
  'err-breath-already-held',
  'err-breath-not-held',
  'err-breath-dead',
] as const;
