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

export type CreateStrategicGameDto = Omit<StrategicGame, 'id' | 'realmName' | 'status' | 'owner'>;

export type UpdateStrategicGameDto = Partial<Omit<StrategicGame, 'id' | 'realmId' | 'realmName' | 'status' | 'owner'>>;
