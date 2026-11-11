/** Creature Law encounter tables and their resolution (spec 061). */

export const ENCOUNTER_TABLE_KINDS = ['biome', 'location', 'universal'] as const;
export type EncounterTableKind = (typeof ENCOUNTER_TABLE_KINDS)[number];

/** `open`: open-ended d100 on rows 01-300. `straight`: d100 on rows 01-100, with no modifiers. */
export type EncounterRollType = 'open' | 'straight';

export const ENCOUNTER_POPULATIONS = ['dense', 'moderate', 'light', 'uninhabited', 'waste'] as const;
export type EncounterPopulation = (typeof ENCOUNTER_POPULATIONS)[number];

/** Table 15.4b codes: sighting, basic (neutral), hostile, attack, trap (ambush). */
export const ENCOUNTER_CODES = ['s', 'b', 'h', 'a', 't'] as const;
export type EncounterCode = (typeof ENCOUNTER_CODES)[number];

export type EncounterCondition = 'water' | 'land';

export interface EncounterRange {
  min: number;
  max: number;
}

export type EncounterEntry =
  | { type: 'npc'; npcIds: string[]; label: string }
  | { type: 'redirect'; tableId: string | null; bonus: number }
  | { type: 'race'; raceId: string | null; label: string }
  | { type: 'event'; key: string; label: string }
  | { type: 'text'; label: string }
  | { type: 'special' };

export type EncounterEntryType = EncounterEntry['type'];

export interface EncounterRow {
  /** Null for the UM 66 row. */
  min: number | null;
  max: number | null;
  um66: boolean;
  condition: EncounterCondition | null;
  entry: EncounterEntry;
}

export interface EncounterSubtable extends EncounterRange {
  rows: EncounterRow[];
}

/** An encounter table as listed, without rows. */
export interface EncounterTableSummary {
  id: string;
  /** T-3.1g biome code, null for the universal tables. */
  biome: string | null;
  kind: EncounterTableKind;
  roll: EncounterRollType;
  subtables: EncounterRange[];
}

export interface EncounterTable extends Omit<EncounterTableSummary, 'subtables'> {
  subtables: EncounterSubtable[];
  source?: { book: string; page: number };
}

export type EncounterSide = 'avoidance' | 'activity';

/** A Table 15.4a modifier: the options of one `group` are exclusive; a null `value` is entered by the GM. */
export interface EncounterModifierSetting {
  key: string;
  side: EncounterSide;
  group: string | null;
  value: number | null;
}

/** A Table 15.4b row: the [social, creature] codes per population; null is "--". */
export type EncounterDifferential = { min: number; max: number | null } & Record<
  EncounterPopulation,
  [EncounterCode | null, EncounterCode | null]
>;

export interface EncounterSpecialSetting {
  key: string;
  tableIds: string[];
}

export interface EncounterSettings {
  id: string;
  modifiers: EncounterModifierSetting[];
  differentials: EncounterDifferential[];
  specials: EncounterSpecialSetting[];
}

/** A checked modifier; `value` only for the variable ones. */
export interface EncounterModifierRequest {
  key: string;
  value?: number;
}

export interface EncounterCheckRoll {
  roll: number;
  modifiers: EncounterModifierRequest[];
}

export interface EncounterCheckRequest {
  population: EncounterPopulation;
  avoidance: EncounterCheckRoll;
  activity: EncounterCheckRoll;
}

export interface ResolveEncounterRequest {
  /** Omit to go straight to the creature. */
  check?: EncounterCheckRequest;
  tableId: string;
  /** The biome table for "Roll on Biome Table"; the API defaults it to `tableId` when that is a biome table. */
  regionTableId?: string;
  water: boolean;
  land: boolean;
  /** GM bonus to the open creature rolls, kept on redirects. */
  creatureModifier?: number;
  /** Creature rolls in order: subtable d100s and creature rolls. */
  rolls: number[];
  /** The unmodified dice of the same rolls, for the UM 66 check. */
  unmodified?: number[];
}

export interface EncounterCheckResult {
  avoidance: number;
  activity: number;
  differential: number;
  encounter: boolean;
  social: EncounterCode | null;
  creature: EncounterCode | null;
}

export interface EncounterPathStep {
  tableId: string;
  subtable: EncounterRange | null;
  roll: number;
  adjustedRoll: number;
  row: { min: number | null; max: number | null } | null;
  clamped: 'high' | 'low' | null;
}

export interface EncounterNextRoll {
  step: 'subtable' | 'creature';
  tableId: string;
  roll: EncounterRollType;
  bonus: number;
}

export interface EncounterResult {
  entry: EncounterEntry;
  um66: boolean;
  special: { key: string } | null;
  conditionUnmet: EncounterCondition | null;
}

export interface ResolveEncounterResponse {
  check: EncounterCheckResult | null;
  path: EncounterPathStep[];
  next: EncounterNextRoll | null;
  result: EncounterResult | null;
}

const DICE = /^\s*(\d+)\s*[dD]\s*(\d+)\s*(?:([+-])\s*(\d+))?\s*$/;

/**
 * Rolls a number-appearing expression (`1d2`, `2d10+1`, `3`). Returns undefined when the expression cannot be read,
 * for the GM to enter the number by hand. Never below 1.
 */
export function rollEncounterDice(
  dice: string | null | undefined,
  random: (sides: number) => number = (sides) => Math.floor(Math.random() * sides) + 1
): number | undefined {
  if (!dice) return undefined;
  const plain = dice.trim();
  if (/^\d+$/.test(plain)) return Math.max(1, Number(plain));
  const match = DICE.exec(plain);
  if (!match) return undefined;
  const count = Number(match[1]);
  const sides = Number(match[2]);
  if (count < 1 || sides < 1 || count > 100) return undefined;
  let total = 0;
  for (let i = 0; i < count; i++) total += random(sides);
  if (match[3]) total += (match[3] === '-' ? -1 : 1) * Number(match[4]);
  return Math.max(1, total);
}
