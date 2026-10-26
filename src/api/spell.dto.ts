/** Spell types and enumerations (spec 028): the contract of rmu-api-spells. */
export type SpellType = 'alchemical' | 'elemental' | 'force' | 'informational' | 'utility';
export type SpellSubtype = 'ball' | 'directed' | 'mental-attack' | 'subconscious';
export type SpellRangeType = 'self' | 'touch' | 'distance' | 'sight' | 'unlimited' | 'varies';
export type SpellAreaKind = 'caster' | 'targets' | 'radius' | 'volume' | 'object' | 'varies';
export type SpellDurationType =
  | 'instant'
  | 'concentration'
  | 'fixed'
  | 'per-level'
  | 'per-failure'
  | 'permanent'
  | 'varies'
  | 'special';
export type SpellDurationScale = 'round' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type SpellResistanceKind = 'none' | 'realm' | 'informational' | 'fear' | 'willing';
export type SpellResistanceScaling = 'all-or-nothing' | 'per-failure';

export const SPELL_TYPES: SpellType[] = ['alchemical', 'elemental', 'force', 'informational', 'utility'];
export const SPELL_SUBTYPES: SpellSubtype[] = ['ball', 'directed', 'mental-attack', 'subconscious'];
export const SPELL_RANGE_TYPES: SpellRangeType[] = ['self', 'touch', 'distance', 'sight', 'unlimited', 'varies'];
export const SPELL_AREA_KINDS: SpellAreaKind[] = ['caster', 'targets', 'radius', 'volume', 'object', 'varies'];
export const SPELL_DURATION_TYPES: SpellDurationType[] = [
  'instant',
  'concentration',
  'fixed',
  'per-level',
  'per-failure',
  'permanent',
  'varies',
  'special',
];
export const SPELL_DURATION_SCALES: SpellDurationScale[] = ['round', 'minute', 'hour', 'day', 'week', 'month', 'year'];
export const SPELL_RESISTANCE_KINDS: SpellResistanceKind[] = ['none', 'realm', 'informational', 'fear', 'willing'];
export const SPELL_RESISTANCE_SCALINGS: SpellResistanceScaling[] = ['all-or-nothing', 'per-failure'];

export type Spell = {
  id: string;
  spellListId: string;
  name: string;
  level: number;
  modifiers: SpellModifiers;
  /** Id of the spell this one is a variant of ("as X, but…"). */
  basedOn: string | null;
  /** What the spell does to its targets. */
  effects: SpellEffect[];
  description: string | null;
  imageUrl: string | null;
  owner?: string;
  accessType?: string;
  version?: number;
  createdAt?: string;
  updatedAt?: string | null;
};

export type SpellModifiers = {
  /** Type code as printed in the book: `Fm`, `Ed`, `U`… */
  typeCode: string | null;
  type: SpellType | null;
  subtype: SpellSubtype | null;
  /** Instantaneous (`*`). */
  instant: boolean;
  /** Power points it costs: null is the level, 0 for the spells that cost none (`•`). */
  powerPoints: number | null;
  /** Spells cast together (`‡`) share it. */
  setGroup: string | null;
  range: SpellRange | null;
  area: SpellArea | null;
  duration: SpellDuration | null;
  resistance: SpellResistance | null;
};

/** Distances in feet. */
export type SpellRange = {
  type: SpellRangeType;
  value: number | null;
  perLevel: boolean;
  /** Step of the directed spells, in feet. */
  increment: number | null;
  raw: string | null;
};

export type SpellArea = {
  kind: SpellAreaKind;
  count: number | null;
  perLevel: boolean;
  /** In feet. */
  radius: number | null;
  /** Volumes and compound measures, as text. */
  dimensions: string | null;
  /** Values of GET /v1/target-types. */
  targetTypes: string[];
  raw: string | null;
};

export type SpellDuration = {
  type: SpellDurationType;
  value: number | null;
  scale: SpellDurationScale | null;
  /** Levels per step: 1 (per level), 5 (per 5 levels)… */
  perLevel: number | null;
  /** Points of RR failure per step. */
  perFailure: number | null;
  concentration: boolean;
  raw: string | null;
};

export type SpellResistance = {
  kind: SpellResistanceKind;
  modifier: number | null;
  scaling: SpellResistanceScaling;
};

// Effects (spec 028) ------------------------------------------------------------------------------------------------

export type SpellEffectKind =
  | 'attack'
  | 'critical'
  | 'damage'
  | 'heal'
  | 'condition'
  | 'modifier'
  | 'afflict'
  | 'cure'
  | 'dispel'
  | 'protection'
  | 'summon'
  | 'movement'
  | 'information'
  | 'creation'
  | 'illusion'
  | 'transformation'
  | 'narrative';
export type SpellEffectAppliesTo = 'self' | 'target' | 'area';
export type SpellAttackTable =
  | 'fire-bolt'
  | 'ice-bolt'
  | 'water-bolt'
  | 'lightning-bolt'
  | 'fire-ball'
  | 'cold-ball'
  | 'lightning-ball'
  | 'sling'
  | 'unarmed-strikes';
export type SpellAttackSize = 'small' | 'medium' | 'big';
export type SpellAttackOb = 'directed-spells' | 'list-ranks';
export type SpellCriticalSeverity = 'A' | 'B' | 'C' | 'D' | 'E';
export type SpellEffectSeverity = 'light' | 'medium' | 'severe';
export type SpellModifierStat =
  | 'ob'
  | 'db'
  | 'rr'
  | 'maneuver'
  | 'skill'
  | 'initiative'
  | 'ap'
  | 'pace'
  | 'hits'
  | 'power-points';
export type SpellAfflictionType = 'disease' | 'poison' | 'curse';
export type SpellHealTier = 'relief' | 'healing' | 'true';
export type SpellDispelScope = 'spell' | 'list' | 'realm' | 'all';

export const SPELL_EFFECT_KINDS: SpellEffectKind[] = [
  'attack',
  'critical',
  'damage',
  'heal',
  'condition',
  'modifier',
  'afflict',
  'cure',
  'dispel',
  'protection',
  'summon',
  'movement',
  'information',
  'creation',
  'illusion',
  'transformation',
  'narrative',
];
export const SPELL_EFFECT_APPLIES_TO: SpellEffectAppliesTo[] = ['self', 'target', 'area'];
export const SPELL_ATTACK_TABLES: SpellAttackTable[] = [
  'fire-bolt',
  'ice-bolt',
  'water-bolt',
  'lightning-bolt',
  'fire-ball',
  'cold-ball',
  'lightning-ball',
  'sling',
  'unarmed-strikes',
];
/** Ids of the critical tables: letters and the types with no letter. */
export const SPELL_CRITICAL_TYPES: string[] = [
  'H',
  'O',
  'L',
  'I',
  'K',
  'P',
  'S',
  'U',
  'G',
  'T',
  'W',
  'acid',
  'holy',
  'steam',
  'subdual',
];
export const SPELL_MODIFIER_STATS: SpellModifierStat[] = [
  'ob',
  'db',
  'rr',
  'maneuver',
  'skill',
  'initiative',
  'ap',
  'pace',
  'hits',
  'power-points',
];
export const SPELL_AFFLICTION_TYPES: SpellAfflictionType[] = ['disease', 'poison', 'curse'];
export const SPELL_INJURY_TYPES: string[] = [
  'bone',
  'cut-burn',
  'muscle-tendon',
  'organ',
  'poison-disease',
  'skin-tissue',
];
export const SPELL_BODY_LOCATIONS: string[] = ['head', 'chest', 'abdomen', 'arm', 'leg'];

/** Fields every effect has. `duration` only when it differs from the spell's; `note` up to 160 characters. */
export type SpellEffectCommon = {
  appliesTo: SpellEffectAppliesTo;
  requiresFailedRr: boolean;
  duration?: SpellDuration | null;
  note?: string;
};

export type SpellAttackEffect = SpellEffectCommon & {
  kind: 'attack';
  attackTable: SpellAttackTable;
  attackSize: SpellAttackSize;
  criticalType?: string | null;
  ob: SpellAttackOb;
  count?: number | null;
  radius?: number | null;
};

/** A fixed severity, or none and an offset (0 or less) from the critical that triggers it. */
export type SpellCriticalEffect = SpellEffectCommon & {
  kind: 'critical';
  criticalType: string;
  severity?: SpellCriticalSeverity | null;
  severityOffset?: number | null;
  /** The severity rises with the RR failure. */
  perFailure?: boolean | number | null;
};

export type SpellDamageEffect = SpellEffectCommon & {
  kind: 'damage';
  hits?: number | null;
  dice?: string | null;
  perLevel?: boolean;
};

export type SpellHealEffect = SpellEffectCommon & {
  kind: 'heal';
  hits?: number | null;
  hitsPerLevel?: number | null;
  /** Hits per round of bleeding it stops, or all of them. */
  bleeding?: number | 'all' | null;
  stunRounds?: number | null;
  injury?: { types?: string[] | null; locations?: string[] | null; severity?: SpellEffectSeverity | null } | null;
  tier?: SpellHealTier | null;
  revive?: boolean;
};

export type SpellConditionEffect = SpellEffectCommon & {
  kind: 'condition';
  /** Id of the core effect-types catalog. */
  status: string;
  rounds?: number | null;
  value?: number | null;
};

export type SpellModifierEffect = SpellEffectCommon & {
  kind: 'modifier';
  stat: SpellModifierStat;
  value: number;
  perLevel?: boolean;
  /** Free tags: `melee`, `fire`, `essence`, skill ids… */
  filter?: string[] | null;
  /** Spells of the same group do not stack. */
  stackGroup?: string | null;
};

/** The periodic effects of an affliction: only the kind and its own fields are required. */
export type SpellAfflictionPeriodicEffect =
  | (Partial<SpellEffectCommon> & Omit<SpellModifierEffect, keyof SpellEffectCommon>)
  | (Partial<SpellEffectCommon> & Omit<SpellDamageEffect, keyof SpellEffectCommon>)
  | (Partial<SpellEffectCommon> & Omit<SpellConditionEffect, keyof SpellEffectCommon>);

export type SpellAfflictEffect = SpellEffectCommon & {
  kind: 'afflict';
  afflictionType: SpellAfflictionType;
  severity?: SpellEffectSeverity | null;
  /** Free text: when it starts. */
  onset?: string | null;
  effects?: SpellAfflictionPeriodicEffect[] | null;
  /** Codes of the lists or spells that cure it. */
  curedBy?: string[] | null;
};

export type SpellCureEffect = SpellEffectCommon & {
  kind: 'cure';
  /** Ids of the effect-types catalog, `disease`, `poison`, `curse` or injury types. */
  removes: string[];
};

export type SpellDispelEffect = SpellEffectCommon & { kind: 'dispel'; scope: SpellDispelScope };

export type SpellProtectionEffect = SpellEffectCommon & { kind: 'protection'; against: string[] };

export type SpellUtilityEffect = SpellEffectCommon & {
  kind: 'summon' | 'movement' | 'information' | 'creation' | 'illusion' | 'transformation' | 'narrative';
};

/** What a spell does: one entry per effect, discriminated by `kind`. */
export type SpellEffect =
  | SpellAttackEffect
  | SpellCriticalEffect
  | SpellDamageEffect
  | SpellHealEffect
  | SpellConditionEffect
  | SpellModifierEffect
  | SpellAfflictEffect
  | SpellCureEffect
  | SpellDispelEffect
  | SpellProtectionEffect
  | SpellUtilityEffect;

type ServerFields = 'id' | 'owner' | 'version' | 'createdAt' | 'updatedAt';

export type CreateSpellDto = Pick<Spell, 'spellListId' | 'name' | 'level'> &
  Partial<Omit<Spell, ServerFields | 'spellListId' | 'name' | 'level' | 'modifiers'>> & {
    modifiers?: Partial<SpellModifiers>;
  };

/** A PATCH: modifiers merge field by field (a null clears one); `version` detects a concurrent change. */
export type UpdateSpellDto = Partial<Omit<Spell, 'id' | 'modifiers'>> & { modifiers?: Partial<SpellModifiers> };
