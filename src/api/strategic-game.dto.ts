export interface StrategicGame {
  id: string;
  name: string;
  realmId: string;
  realmName: string;
  status: string;
  options: StrategicGameOptions;
  powerLevel: StrategicGamePowerLevel;
  description?: string;
  shortDescription?: string;
  imageUrl?: string;
  owner: string;
  /** Calendar of the campaign (spec 065). */
  calendar: GameCalendar;
  /** Optimistic concurrency: send it back to detect a concurrent change. */
  version?: number;
}

/** Calendar of a campaign (spec 065): a free text start date and the days elapsed since then. */
export interface GameCalendar {
  /** Free text, '' when there is none. */
  startDate: string;
  elapsedDays: number;
  /** Loose hours of the current day, 0–23. */
  elapsedHours: number;
  /** elapsedDays + 1 */
  currentDay: number;
}

/** What a character does while the time passes (spec 065): `rest` by default. */
export const PASS_TIME_ACTIVITIES = ['full-rest', 'rest', 'excluded'] as const;
export type PassTimeActivity = (typeof PASS_TIME_ACTIVITIES)[number];

/** Most days of one step of time. */
export const MAX_PASS_TIME_DAYS = 365;

export interface PassTimeRequest {
  days: number;
  /** 0–23 */
  hours: number;
  note?: string;
  /** Activity per character; the ones not listed rest. */
  characters?: { characterId: string; activity: PassTimeActivity }[];
  /** Calculate without storing anything (preview). */
  dryRun?: boolean;
  /** Version of the game read by the client: a stale one is a 409. */
  version: number;
}

/** Result of the rest of a character in a step of time. */
export interface PassTimeRestResult {
  hpBefore: number;
  hpAfter: number;
  days: number;
  injuries: { injuryId: string; days: number; penalty: number; remainingDays: number; status: string }[];
  resolvedConditions: string[];
  powerBefore: number | null;
  powerAfter: number | null;
  poisonings?: { injuryId: string; elapsedRounds: number; penalty: number; status: string }[];
}

export interface GameTimeLogCharacter {
  characterId: string;
  name: string;
  activity: PassTimeActivity;
  /** When the rest was applied (or calculated, on a dry run). */
  result?: PassTimeRestResult;
  /** Why it was not applied: the rest can be retried for that character alone. */
  error?: { code: string; message: string };
}

export interface PassTimeResult {
  /** The game with its new calendar (the unchanged one on a dry run). */
  game: StrategicGame;
  fromDay: number;
  toDay: number;
  days: number;
  hours: number;
  dryRun: boolean;
  characters: GameTimeLogCharacter[];
  logEntryId?: string;
}

export type GameTimeLogType = 'pass-time' | 'adjust';

export interface GameTimeLogEntry {
  id: string;
  gameId: string;
  type: GameTimeLogType;
  fromDay: number;
  toDay: number;
  days: number;
  hours: number;
  note?: string;
  characters: GameTimeLogCharacter[];
  userId: string;
  createdAt: string;
}

export interface StrategicGameOptions {
  experienceMultiplier: number;
  fatigueMultiplier: number;
  boardScaleMultiplier: number;
  letality: number;
  /** Allows a third rank of the same skill in a level, at the cost of the second one (default false). */
  allowThirdRank?: boolean;
  /** How talents can be bought at creation (default 'free'). */
  talentPolicy?: TalentPolicy;
  /** When true, the bonus points per level limit also applies to talents bought at creation (default false). */
  bonusDevPointsCapAtCreation?: boolean;
  /** Stat generation method at creation (default 'roll'). */
  statGeneration?: StatGeneration;
  /** Open rounds: an action unresolved at the end of a round carries over to the next one, keeping its action points (default true). */
  openRounds?: boolean;
}

export const TALENT_POLICIES = ['free', 'race-points-at-creation', 'flaw-points-at-creation'] as const;
export type TalentPolicy = (typeof TALENT_POLICIES)[number];

export const STAT_GENERATIONS = ['roll', 'point-buy'] as const;
export type StatGeneration = (typeof STAT_GENERATIONS)[number];

export interface StrategicGamePowerLevel {
  baseDevPoints: number;
  statRandomMin: number;
  statBoostPotential: number;
  statBoostTemporary: number;
  statCreationBoost: number;
  statCreationSwap: number;
  /** Maximum development points a character can spend on traits (default 20). */
  maxTraitCost?: number;
  /** Maximum bonus development points (race and game master) spendable in a level (default 25). */
  raceDevPointsPerLevel?: number;
  /** Bonus development points granted by the game master at creation, added to the race pool (default 0). */
  creationBonusDevPoints?: number;
  /** Budget of the point-buy stat generation (default 15). */
  statPoints?: number;
  /** Knacks per profession (default 2). */
  knackCount?: number;
  /** Bonus of each knack (default 5). */
  knackBonus?: number;
}

export type CreateStrategicGameDto = Omit<
  StrategicGame,
  'id' | 'realmName' | 'status' | 'owner' | 'calendar' | 'version'
> & {
  /** A new game always starts at day 1 (spec 065). */
  calendar?: { startDate?: string };
};

export type UpdateStrategicGameDto = Partial<
  Omit<StrategicGame, 'id' | 'realmId' | 'realmName' | 'status' | 'owner' | 'calendar'>
> & {
  /** Start date and a correction of the elapsed days, which applies no effects (spec 065). */
  calendar?: { startDate?: string; elapsedDays?: number };
};
