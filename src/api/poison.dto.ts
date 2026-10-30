// Poisons (workspace spec 042): the poison and antidote blocks of the catalog, the poisoning of an injury and the
// requests of the strategic and tactical poison endpoints. Time is counted in rounds from the exposure.
import type { RollModifier } from '../rmu/RollBreakdown';
import { InjurySource } from './health.dto';

export type PoisonCategory =
  | 'circulatory'
  | 'conversion'
  | 'muscle'
  | 'nerve'
  | 'paralytic'
  | 'reduction'
  | 'respiratory'
  | 'irritant';
export type PoisonSeverity = 'mild' | 'moderate' | 'severe' | 'extreme';
export type PoisonForm = 'liquid' | 'paste' | 'powder' | 'ingest' | 'gas';
export type PoisonCondition = 'unconscious' | 'coma' | 'paralyzed' | 'incapacitated' | 'dead';
export type AntidoteSource = 'item' | 'external' | 'magic';

export const POISON_CATEGORIES: PoisonCategory[] = [
  'circulatory',
  'conversion',
  'muscle',
  'nerve',
  'paralytic',
  'reduction',
  'respiratory',
  'irritant',
];
export const POISON_SEVERITIES: PoisonSeverity[] = ['mild', 'moderate', 'severe', 'extreme'];
export const POISON_FORMS: PoisonForm[] = ['liquid', 'paste', 'powder', 'ingest', 'gas'];
/** Forms that coat a weapon. */
export const COATING_FORMS: PoisonForm[] = ['liquid', 'paste'];
/** An antidote of any category. */
export const ANY_POISON = 'any';

/** Rounds of 10 seconds in an hour. */
export const ROUNDS_PER_HOUR = 360;

export type PoisonRange = { min: number; max: number };

/** `features.poison` of a catalog item. */
export type ItemPoison = {
  category: PoisonCategory;
  /** Attack level of the RR. */
  level: number;
  form: PoisonForm;
  /** Worst severity it can reach; null is extreme. */
  maxSeverity: PoisonSeverity | null;
  immediateHits: PoisonRange | null;
  onsetRounds: PoisonRange | null;
};

/** `features.antidote` of a catalog item. */
export type ItemAntidote = {
  categories: (PoisonCategory | typeof ANY_POISON)[];
  level: number;
  /** Hours after the exposure it still works; null is any time. */
  withinHours: number | null;
};

/** The poison of an exposure: a catalog item, or one the game master describes. */
export type PoisonData = {
  itemTypeId?: string;
  name: string;
  category: PoisonCategory;
  level: number;
  form?: PoisonForm;
  maxSeverity?: PoisonSeverity | null;
  immediateHits?: PoisonRange | null;
  onsetRounds?: PoisonRange | null;
};

/** The poison data of a catalog item with a poison block. */
export const poisonOfItem = (item: {
  id: string;
  name: string;
  features?: { poison?: ItemPoison | null } | null;
}): PoisonData | undefined => {
  const poison = item.features?.poison;
  if (!poison) return undefined;
  return { itemTypeId: item.id, name: item.name, ...poison };
};

/** A poison that reached a tactical actor and waits for its RR. */
export type PoisonExposure = {
  id: string;
  poison: PoisonData;
  source: InjurySource;
  createdAt: string;
};

/** One severity of a poisoning. Times in rounds from the exposure. */
export type PoisonStage = {
  severity: PoisonSeverity;
  startsAt: number;
  /** Null lasts until the poisoning is cured. */
  endsAt: number | null;
  penalty: number;
  hitsPerRound: number;
  hitsUntil: number | null;
  condition: PoisonCondition | null;
  conditionAt: number | null;
  conditionUntil: number | null;
  permanent: boolean;
  started: boolean;
  ended: boolean;
  conditionApplied?: boolean;
};

export type PoisonAntidote = {
  at: string;
  source: AntidoteSource;
  name: string;
  itemTypeId?: string;
  level?: number;
  neutralized: boolean;
};

/** The `poison` block of a `poison-disease` injury. */
export type InjuryPoison = {
  itemTypeId?: string;
  name: string;
  category: PoisonCategory;
  level: number;
  form?: PoisonForm;
  rr: { roll: number; bonus: number; total: number; failure: number };
  severity: PoisonSeverity;
  stages: PoisonStage[];
  /** Rounds since the exposure. */
  elapsedRounds: number;
  exposedAt: string;
  neutralized?: boolean;
  /** Every stage ended, or an antidote neutralized it. */
  finished?: boolean;
  antidotes?: PoisonAntidote[];
};

/** Poison on a weapon of the strategic module: the next hit in a tactical game spends it. */
export type ItemCoating = {
  itemTypeId?: string;
  name: string;
  poison: PoisonData;
  appliedAt: string;
  hoursLeft?: number | null;
};

/** An entry of the RR breakdown, with its group, rule and inputs since workspace spec 052. */
export type PoisonRrModifier = RollModifier;

/** The poison RR the server resolved. */
export type PoisonRrResult = {
  roll: number;
  bonus: number;
  attackLevel: number;
  breakdown: PoisonRrModifier[];
  total: number;
  required: number;
  resisted: boolean;
  failure: number;
  severity?: PoisonSeverity;
};

/** `POST v1/characters/:id/poisonings`: exposure and RR in one step. Without a roll the server rolls it. */
export type PoisonCharacterDto = {
  poison: PoisonData;
  roll?: number;
  bonus?: number;
  modifiers?: PoisonRrModifier[];
};

/** `POST v1/actor-rounds/:id/poisonings/:exposureId/resolve`. */
export type ResolvePoisoningDto = {
  roll?: number;
  bonus?: number;
  modifiers?: PoisonRrModifier[];
};

/**
 * `POST .../injuries/:injuryId/antidote`. Strategic takes `itemId` (an item of the character, one dose is spent);
 * tactical takes the catalog data. External and magic antidotes give their own data.
 */
export type GiveAntidoteDto = {
  source: AntidoteSource;
  name?: string;
  itemId?: string;
  itemTypeId?: string;
  categories?: string[];
  level?: number;
  withinHours?: number | null;
};

/** Stages started and not ended at the elapsed rounds of the poisoning. */
export const activePoisonStages = (poison: InjuryPoison): PoisonStage[] =>
  poison.stages.filter((stage) => stage.started && !stage.ended);

/** The next stage still to start, unless the poisoning is over. */
export const nextPoisonStage = (poison: InjuryPoison): PoisonStage | undefined =>
  poison.finished ? undefined : poison.stages.find((stage) => !stage.started);
