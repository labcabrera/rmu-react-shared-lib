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
  /** The players of the game who change the faction and what hangs from it (spec 072). Missing in older factions. */
  players?: string[];
  /** The names of its players, by user id (spec 072). */
  playerNames?: Record<string, string>;
  /** What the user can do with it (spec 072): `manage` for the masters, `write` for its players, `read` for the rest. */
  access?: StrategicAccess;
}

/** What a user can do with a faction, a character or an item of a strategic game (spec 072). */
export type StrategicAccess = 'manage' | 'write' | 'read';

/** The masters, and the players of the faction (spec 072): they change it and what hangs from it. */
export const canWriteStrategic = (entity: { access?: StrategicAccess } | null | undefined): boolean =>
  entity?.access === 'manage' || entity?.access === 'write';

/** The masters of the game (spec 072). */
export const canManageStrategic = (entity: { access?: StrategicAccess } | null | undefined): boolean =>
  entity?.access === 'manage';

/** The names of the players of a faction, in their order (spec 072): their id when the name is unknown. */
export const factionPlayerNames = (faction: Pick<Faction, 'players' | 'playerNames'>): string[] =>
  (faction.players ?? []).map((id) => faction.playerNames?.[id] ?? id);

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

