export interface Faction {
  id: string;
  gameId: string;
  name: string;
  management: FactionManagement;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  owner?: string;
}

export interface FactionManagement {
  availableGold: number;
  availableXP: number;
}

export type CreateFactionDto = Omit<Faction, 'id'>;

export type UpdateFactionDto = Partial<Omit<Faction, 'id'>>;
