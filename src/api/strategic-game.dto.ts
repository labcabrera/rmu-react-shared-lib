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
}

export type CreateStrategicGameDto = Omit<StrategicGame, 'id' | 'realmName' | 'status' | 'owner'>;

export type UpdateStrategicGameDto = Partial<Omit<StrategicGame, 'id' | 'realmId' | 'realmName' | 'status' | 'owner'>>;
