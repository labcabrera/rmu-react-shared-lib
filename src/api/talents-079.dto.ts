/*
 * Workspace spec 079, phase 7 (block D, talents): contracts of strategic and tactical for the talents of Core Law ch. 4
 * that the sheet or the tactical game now apply. Mirrors of the API registries so the MFEs can show the same values.
 */

// ---------------------------------------------------------------------------------------------------------------
// D1: Deadeye and Uncoordinated
// ---------------------------------------------------------------------------------------------------------------

/** A range of a ranged attack of the sheet; `traitBonus` is the Deadeye share already inside `bonus`. */
export interface CharacterAttackRangeWithTalent {
  from: number;
  to: number;
  bonus: number;
  traitBonus?: number;
}

/** Breakdown lines of the tactical range: `range-penalty` (without Deadeye) and `deadeye` (params `tier`). */
export const RANGE_BREAKDOWN_KEYS = ['range-penalty', 'deadeye'] as const;

/** Paces of tactical movement, slowest first. */
export const PACE_ORDER = ['creep', 'walk', 'jog', 'run', 'sprint', 'dash'] as const;
export type TacticalPace = (typeof PACE_ORDER)[number];

/** Penalty of each pace up to run, as the tactical API. */
const PACE_PENALTIES: Record<string, number> = { creep: 0, walk: -25, jog: -50, run: -75 };
/** Penalty per step past run of an Uncoordinated actor (its attack stays legal). */
export const UNCOORDINATED_BEYOND_RUN_STEP = -25;

/** Pace an Uncoordinated actor of that tier moves at: one step faster per tier. */
export const effectivePace = (pace: string, tier = 0): string => {
  const index = PACE_ORDER.indexOf(pace as TacticalPace);
  if (index < 0 || tier <= 0) return pace;
  return PACE_ORDER[Math.min(index + tier, PACE_ORDER.length - 1)];
};

/**
 * Penalty of a pace for an attack or a maneuver: the one of the effective pace up to run; past run (only reachable by
 * Uncoordinated) -75 and -25 more per step (Table 5-3). Only a declared sprint or dash forbids the attack.
 */
export const pacePenaltyFor = (pace: string, tier = 0): number => {
  const index = PACE_ORDER.indexOf(pace as TacticalPace);
  if (index < 0) return 0;
  const effective = index + Math.max(0, tier);
  const run = PACE_ORDER.indexOf('run');
  if (effective <= run) return PACE_PENALTIES[PACE_ORDER[effective]] ?? 0;
  return PACE_PENALTIES.run + UNCOORDINATED_BEYOND_RUN_STEP * (effective - run);
};

// ---------------------------------------------------------------------------------------------------------------
// D2: endurance, load and sleep (strategic sheet)
// ---------------------------------------------------------------------------------------------------------------

/** Endurance bonus per tier: Vigorous +, Feeble -. Stored in `CharacterEndurance.traitBonus`. */
export const ENDURANCE_TRAIT_PER_TIER = 10;
/** Load carried without penalty per tier of Beast of Burden (% of the weight allowance). */
export const BEAST_OF_BURDEN_PER_TIER = 10;

/** Fields the strategic sheet gains. */
export interface CharacterEnduranceTalentFields {
  /** Vigorous/Feeble share of the Endurance bonus; tactical adds it to the fatigue Endurance. */
  traitBonus?: number;
}
export interface CharacterEquipmentTalentFields {
  /** Encumbrance penalty of the dodge: Beast of Burden does not lower it. Falls back to `encumbrancePenalty`. */
  dodgeEncumbrancePenalty?: number;
}

/** Factor of the period of rest that recovers power points: Efficient Sleeper I-II, Restless Sleeper I-II. */
export const SLEEPER_PERIOD_FACTORS: Record<string, number[]> = {
  'efficient-sleeper': [0.75, 0.5],
  'restless-sleeper': [1.25, 1.5],
};
/** Base hours of a period of rest. */
export const REST_PERIOD_HOURS = 2;
/** Most periods of rest that recover power points per day. */
export const MAX_REST_PERIODS_PER_DAY = 4;

/** Hours of a period of rest with the sleeper talents of the character (hits are not affected). */
export const restPeriodHours = (traits: { traitId: string; tier?: number | null }[] | undefined): number => {
  let hours = REST_PERIOD_HOURS;
  for (const trait of traits ?? []) {
    const factors = SLEEPER_PERIOD_FACTORS[trait.traitId];
    if (!factors) continue;
    hours *= factors[Math.min(Math.max(trait.tier || 1, 1), factors.length) - 1];
  }
  return hours;
};

// ---------------------------------------------------------------------------------------------------------------
// D3: situational talents of a maneuver
// ---------------------------------------------------------------------------------------------------------------

/** Situation in which a talent helps (i18n `situational-trait-<condition>`). */
export const SITUATIONAL_CONDITIONS = [
  'calm-or-persuade',
  'read-emotions',
  'animal-of-its-type',
  'flexible-limb',
  'wake-up',
  'fall-control',
  'perceive-by-smell',
] as const;
export type SituationalCondition = (typeof SITUATIONAL_CONDITIONS)[number];

/** A situational talent: ticked by the game master on the maneuver, or automatic with a purpose. */
export interface SituationalTraitBonus {
  traitId: string;
  /** Skills it helps; none: any skill. */
  skills?: string[];
  /** Specializations of a skill it is limited to (Golden Throat on `music`: `singing`). */
  specializations?: Record<string, string[]>;
  valuePerTier: number;
  fixed?: boolean;
  condition: SituationalCondition;
  mode: 'ticked' | 'automatic';
  purpose?: string;
}

/** Mirror of the tactical registry (workspace spec 079, D3). */
export const SITUATIONAL_TRAIT_BONUSES: SituationalTraitBonus[] = [
  {
    traitId: 'golden-throat',
    skills: ['influence', 'leadership', 'music'],
    specializations: { music: ['singing'] },
    valuePerTier: 10,
    condition: 'calm-or-persuade',
    mode: 'ticked',
  },
  { traitId: 'empathy', skills: ['social-awareness'], valuePerTier: 50, fixed: true, condition: 'read-emotions', mode: 'ticked' },
  {
    traitId: 'animal-empathy',
    skills: ['animal-handling', 'riding'],
    valuePerTier: 25,
    fixed: true,
    condition: 'animal-of-its-type',
    mode: 'ticked',
  },
  { traitId: 'extra-joints', valuePerTier: 20, fixed: true, condition: 'flexible-limb', mode: 'ticked' },
  { traitId: 'light-sleeper', skills: ['perception'], valuePerTier: 25, fixed: true, condition: 'wake-up', mode: 'ticked' },
  { traitId: 'heavy-sleeper', skills: ['perception'], valuePerTier: -25, fixed: true, condition: 'wake-up', mode: 'ticked' },
  {
    traitId: 'wings-vestigial',
    valuePerTier: 10,
    fixed: true,
    condition: 'fall-control',
    mode: 'automatic',
    purpose: 'fall-control',
  },
];

/** Odour of the target of a Perception or Tracking by smell (lines `target-<traitId>`, group senses). */
export const TARGET_ODOR_BONUSES: { traitId: string; value: number }[] = [
  { traitId: 'neutral-odor', value: -50 },
  { traitId: 'distinct-odor', value: 50 },
];
export const ODOR_SKILLS = ['perception', 'tracking'];

/** A situational talent the actor has for a maneuver (`GET /v1/actions/:id/maneuver/modifiers` → `situationalTraits`). */
export interface SituationalTraitOption {
  traitId: string;
  value: number;
  tier: number;
  condition: SituationalCondition;
  mode: 'ticked' | 'automatic';
  rule: string;
  specialization?: string;
  /** Golden Throat on Singing: the bonus of Perfect Pitch or Musical the sheet already counts. */
  replaces?: number;
}

/** Fields `ResolveManeuverDto` gains. */
export interface ResolveManeuverTalentFields {
  /** Ticked situational talents (`err-maneuver-situational-trait` when one does not apply). */
  situationalTraits?: string[];
  /** Actor perceived or tracked by smell (its Neutral or Distinct Odor); `targetActorId` by default. */
  senseTargetActorId?: string;
}

/** The situational talents of a character sheet that may help a skill (for the sheet chips; they are not in the total). */
export const situationalTraitsForSkill = (
  skill: { skillId: string; specialization?: string | null },
  traits: { traitId: string; tier?: number | null; missingReference?: boolean }[] | undefined,
): { traitId: string; tier: number; value: number; condition: SituationalCondition }[] =>
  SITUATIONAL_TRAIT_BONUSES.flatMap((entry) => {
    const trait = (traits ?? []).find((each) => each.traitId === entry.traitId && !each.missingReference);
    if (!trait) return [];
    if (entry.mode === 'automatic' || !entry.skills) return [];
    if (!entry.skills.includes(skill.skillId)) return [];
    const specializations = entry.specializations?.[skill.skillId];
    if (specializations && (!skill.specialization || !specializations.includes(skill.specialization))) return [];
    const tier = Math.max(1, trait.tier || 1);
    return [{ traitId: entry.traitId, tier, value: entry.fixed ? entry.valuePerTier : entry.valuePerTier * tier, condition: entry.condition }];
  });

/** Attack flag of Extra Joints (`PrepareAttackItemDto.modifiers.extraJoints`): +20 when the flexible limb helps. */
export const EXTRA_JOINTS_ATTACK_BONUS = 20;
export interface AttackTalentModifiers {
  extraJoints?: boolean;
}

// ---------------------------------------------------------------------------------------------------------------
// D4: Elemental Resistance and Susceptibility
// ---------------------------------------------------------------------------------------------------------------

export const ELEMENTAL_RESISTANCE = 'elemental-resistance';
export const ELEMENTAL_SUSCEPTIBILITY = 'elemental-susceptibility';
/** DB, RR and Endurance per tier against the element. */
export const ELEMENTAL_PER_TIER = 5;
/** Tiers that move a fixed critical one severity. */
export const ELEMENTAL_TIERS_PER_SEVERITY = 2;
/** Elements of the specialization (i18n `element-<id>`); water, earth and air come from Creature Law stat blocks. */
export const ELEMENTS = ['cold', 'heat', 'electricity', 'water', 'earth', 'air'] as const;
export type Element = (typeof ELEMENTS)[number];

/** Element of a critical type: `H` and steam heat, `O` cold, `L` electricity. */
export const elementOfCritical = (criticalType: string | null | undefined): Element | null => {
  switch (criticalType) {
    case 'H':
    case 'steam':
      return 'heat';
    case 'O':
      return 'cold';
    case 'L':
      return 'electricity';
    default:
      return null;
  }
};

/** Breakdown keys: DB and RR line, Endurance line in extreme temperatures, and the severity step. */
export const ELEMENTAL_TALENT_KEY = 'elemental-talent';
export const ELEMENTAL_ENVIRONMENT_KEY = 'elemental-environment';

const ELEMENT_ALIASES: Record<string, Element> = {
  cold: 'cold',
  ice: 'cold',
  'cold-ice': 'cold',
  frost: 'cold',
  heat: 'heat',
  fire: 'heat',
  'heat-fire': 'heat',
  steam: 'heat',
  electricity: 'electricity',
  lightning: 'electricity',
  light: 'electricity',
  'electricity-light': 'electricity',
  water: 'water',
  earth: 'earth',
  air: 'air',
  wind: 'air',
};

/** Element of a specialization (any case, `/`, `_` or spaces as separators), null when it names none. */
export const elementOf = (specialization: string | null | undefined): Element | null => {
  if (!specialization) return null;
  const key = specialization
    .trim()
    .toLowerCase()
    .replace(/[\s/_]+/g, '-');
  return ELEMENT_ALIASES[key] ?? null;
};

type ElementalTrait = { traitId: string; tier?: number | null; specialization?: string | null };

const elementalTier = (traits: ElementalTrait[] | undefined, traitId: string, element: Element) =>
  (traits ?? [])
    .filter((trait) => trait.traitId === traitId && elementOf(trait.specialization) === element)
    .reduce((max, trait) => Math.max(max, trait.tier || 1), 0);

/** Modifier of the elemental talents against an element: +5 per tier of Resistance, -5 per tier of Susceptibility. */
export const elementalModifier = (traits: ElementalTrait[] | undefined, element: Element | null | undefined): number => {
  if (!element) return 0;
  return ELEMENTAL_PER_TIER * (elementalTier(traits, ELEMENTAL_RESISTANCE, element) - elementalTier(traits, ELEMENTAL_SUSCEPTIBILITY, element));
};

/** Severity steps of a fixed critical of the element: -1 per 2 tiers of Resistance, +1 per 2 of Susceptibility. */
export const elementalSeveritySteps = (traits: ElementalTrait[] | undefined, element: Element | null | undefined): number => {
  if (!element) return 0;
  return (
    Math.floor(elementalTier(traits, ELEMENTAL_SUSCEPTIBILITY, element) / ELEMENTAL_TIERS_PER_SEVERITY) -
    Math.floor(elementalTier(traits, ELEMENTAL_RESISTANCE, element) / ELEMENTAL_TIERS_PER_SEVERITY)
  );
};

/** Element of an extreme temperature of the game. */
export const elementOfTemperature = (kind: 'cold' | 'heat' | null | undefined): Element | null => kind ?? null;

// ---------------------------------------------------------------------------------------------------------------
// D5: Breath Holding
// ---------------------------------------------------------------------------------------------------------------

export const BREATH_HOLDING = 'breath-holding';
export const BREATH_HOLDING_ROUNDS_PER_LEVEL = 12;
export const BREATH_HOLDING_INACTIVE_FACTOR = 2;
export const BREATH_HOLDING_MEDITATION_FACTOR = 3;

/** Rounds of Breath Holding: 12 per level (at least 1), twice inactive, three times with Meditation. */
export const breathHoldingRounds = (input: { level: number; inactive?: boolean; meditation?: boolean }): number => {
  const level = Math.max(1, Math.floor(input.level || 0));
  const factor = input.meditation ? BREATH_HOLDING_MEDITATION_FACTOR : input.inactive ? BREATH_HOLDING_INACTIVE_FACTOR : 1;
  return BREATH_HOLDING_ROUNDS_PER_LEVEL * level * factor;
};

/** `StartBreathDto` gains `inactive` and `meditation` (environment-079.dto.ts). */

/** `ActorRoundBreath.breathHolding`: the talent limit, used when longer than the base one. */
export interface BreathHoldingLimit {
  rounds: number;
  level: number;
  inactive: boolean;
  meditation: boolean;
}

/** Error codes of block D in tactical. */
export const TALENT_ERROR_CODES = ['err-maneuver-situational-trait'] as const;
