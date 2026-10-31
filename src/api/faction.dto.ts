export interface Faction {
  id: string;
  gameId: string;
  name: string;
  management: FactionManagement;
  shortDescription?: string;
  description?: string;
  imageUrl?: string;
  owner?: string;
  /** NPCs of the faction (spec 055): guards, mercenaries, mounts… Missing in older factions. */
  npcs?: FactionNpc[];
}

/** NPCs of one kind in a faction: `count` specimens of an NPC of rmu-api-npcs, under an alias. */
export interface FactionNpc {
  id: string;
  npcId: string;
  /** Alias in the campaign ("Gate guards"); the NPC's name by default. */
  name: string;
  /** From 1 to {@link FACTION_NPC_MAX_COUNT}. */
  count: number;
  notes: string | null;
}

/** An entry of a `PATCH` of the NPCs: without `id` it is a new one; an empty `name` takes the NPC's. */
export type FactionNpcInput = Pick<FactionNpc, 'npcId' | 'count'> & Partial<Pick<FactionNpc, 'id' | 'name' | 'notes'>>;

/** Most specimens of one NPC entry, in a faction or a tactical game (spec 055). */
export const FACTION_NPC_MAX_COUNT = 50;

export interface FactionManagement {
  availableGold: number;
}

export type CreateFactionDto = Omit<Faction, 'id' | 'npcs'>;

export type UpdateFactionDto = Partial<Omit<Faction, 'id' | 'npcs'>> & {
  /** Replaces the whole list. */
  npcs?: FactionNpcInput[];
};
