/** What the user can do with a strategic game (spec 071), from less to more. */
export const GAME_ACCESS_LEVELS = ['none', 'cover', 'spectator', 'player', 'master', 'owner'] as const;
export type GameAccessLevel = (typeof GAME_ACCESS_LEVELS)[number];

export const gameAccessAtLeast = (level: GameAccessLevel | undefined, required: GameAccessLevel): boolean =>
  GAME_ACCESS_LEVELS.indexOf(level ?? 'none') >= GAME_ACCESS_LEVELS.indexOf(required);

/** Roles of the members of a game (spec 071); the owner of the game is not a member. */
export const GAME_MEMBER_ROLES = ['master', 'player', 'spectator'] as const;
export type GameMemberRole = (typeof GAME_MEMBER_ROLES)[number];

export interface GameMember {
  userId: string;
  userName: string;
  role: GameMemberRole;
  joinedAt: string;
}

export interface GameJoinRequest {
  userId: string;
  userName: string;
  message: string | null;
  requestedAt: string;
}

export interface GameMembers {
  members: GameMember[];
  /** Only for the masters, or the own request of a user who is not a member. */
  joinRequests: GameJoinRequest[] | null;
}

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
  /** Private: only its members read it. Public: anybody reads its cover and can ask to join (spec 071). */
  accessType?: 'public' | 'private';
  /** What the user can do with the game (spec 071). */
  access?: GameAccessLevel;
  /** For the members of the game. */
  members?: GameMember[];
  /** For the masters. */
  joinRequests?: GameJoinRequest[];
  /** Whether the owner still reads the realm (GET by id, for the masters). */
  realmReadable?: boolean;
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

/**
 * What a character does while the time passes (spec 065): `rest` by default. `active` (workspace spec 079, C2): heals
 * without rest, hits only in 8 sleep hours a day and untreated injuries frozen.
 */
export const PASS_TIME_ACTIVITIES = ['full-rest', 'rest', 'active', 'excluded'] as const;
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
  /** Fatigue penalty before and after the rest (spec 077): one point per minute. */
  fatigueBefore?: number;
  fatigueAfter?: number;
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
  /**
   * Intense training (workspace spec 076): one skill per level may take more than two ranks, the extra ones at the cost
   * of the second (default false). Replaces `allowThirdRank`, which the API still accepts on input but never returns.
   */
  intenseTraining?: boolean;
  /** The game master allows keeping the unspent normal development points for the next level (spec 076, default false). */
  allowSavingDevPoints?: boolean;
  /** How talents can be bought at creation (default 'free'). */
  talentPolicy?: TalentPolicy;
  /** When true, the bonus points per level limit also applies to talents bought at creation (default false). */
  bonusDevPointsCapAtCreation?: boolean;
  /** Stat generation method at creation (default 'roll'). */
  statGeneration?: StatGeneration;
  /** Open rounds: an action unresolved at the end of a round carries over to the next one, keeping its action points (default true). */
  openRounds?: boolean;
  /**
   * Optional purchase rules of talents and flaws (workspace spec 077, default false): prerequisites per tier, flaws that
   * hinder, linked flaws and one loose flaw up to -20.
   */
  talentPurchaseRules?: boolean;
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
  'id' | 'realmName' | 'status' | 'owner' | 'calendar' | 'version' | 'access' | 'members' | 'joinRequests' | 'realmReadable'
> & {
  /** A new game always starts at day 1 (spec 065). */
  calendar?: { startDate?: string };
};

export type UpdateStrategicGameDto = Partial<
  Omit<
    StrategicGame,
    'id' | 'realmId' | 'realmName' | 'status' | 'owner' | 'calendar' | 'access' | 'members' | 'joinRequests' | 'realmReadable'
  >
> & {
  /** Start date and a correction of the elapsed days, which applies no effects (spec 065). */
  calendar?: { startDate?: string; elapsedDays?: number };
};
