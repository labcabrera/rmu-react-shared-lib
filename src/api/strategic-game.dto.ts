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
}

export interface StrategicGamePowerLevel {
  baseDevPoints: number;
  statRandomMin: number;
  statBoostPotential: number;
  statBoostTemporary: number;
  statCreationBoost: number;
  statCreationSwap: number;
  /** Maximum development points a character can spend on traits (default 20). */
  maxTraitCost?: number;
}

export type CreateStrategicGameDto = Omit<StrategicGame, 'id' | 'realmName' | 'status' | 'owner'>;

export type UpdateStrategicGameDto = Partial<Omit<StrategicGame, 'id' | 'realmId' | 'realmName' | 'status' | 'owner'>>;
