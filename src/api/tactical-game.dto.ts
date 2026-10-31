import { CharacterCondition, CharacterFate, HpBySource, HpLogEntry, Injury } from './health.dto';
import { StrategicItemModifier } from './item-modifier.dto';

export type TacticalGameStatus = 'created' | 'in_progress' | 'finished';

export type TacticalGame = {
  id: string;
  strategicGameId: string;
  name: string;
  status: TacticalGameStatus;
  round: number;
  phase: string;
  /** Ids of the strategic factions, plus {@link ENVIRONMENT_FACTION_ID} while the environment has NPCs (spec 055). */
  factions: string[];
  actors: TacticalGameActor[];
  environment: TacticalGameEnvironment;
  /** The environment faction (spec 055): the NPCs of no player, owned by the game master. */
  environmentFaction?: TacticalGameEnvironmentFaction | null;
  description: string;
  owner: string;
  imageUrl?: string;
  /** Result of the game, set when it is finished. */
  outcome?: TacticalGameOutcome;
};

/** @deprecated The API sends {@link TacticalGameActor}. */
export type ActorRoundSelection = {
  id: string;
  actorId: string;
};

/** Reserved faction id of the environment of a tactical game (spec 055, decision 2). */
export const ENVIRONMENT_FACTION_ID = 'environment';

/** Name the API gives the environment when none is set; the front shows it translated. */
export const DEFAULT_ENVIRONMENT_NAME = 'Environment';

/**
 * An actor of a tactical game. A character has the id of its sheet; an NPC specimen (spec 055) has an id of its own
 * and its NPC in `npcId`, named `Wolf 1`, `Wolf 2`…
 */
export type TacticalGameActor = {
  id: string;
  name: string;
  faction: { id: string; name: string };
  type: 'character' | 'npc';
  /** Who plays it: the owner of the character or of the faction, the game master for the environment. */
  owner: string;
  npcId?: string;
};

/** NPCs of one kind chosen for a game: `count` specimens named after `name`. */
export type TacticalGameNpc = {
  npcId: string;
  count: number;
  name: string;
};

export type TacticalGameEnvironmentFaction = {
  factionId: typeof ENVIRONMENT_FACTION_ID;
  name: string;
  npcs: TacticalGameNpc[];
};

/** NPCs requested for a faction of the game (`environment` for the environment): 1 specimen by default. */
export type TacticalGameNpcRequest = {
  npcId: string;
  factionId: string;
  count?: number;
  name?: string;
};

export type CreateEnvironmentFactionDto = {
  name?: string;
  npcs: Omit<TacticalGameNpcRequest, 'factionId'>[];
};

export type TacticalGameEnvironment = {
  temperatureFatigueModifier: number;
  altitudeFatigueModifier: number;
};

export type CreateTacticalGameDto = Omit<
  TacticalGame,
  'id' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner' | 'environmentFaction'
> & {
  factions?: string[];
  /** The NPCs of the strategic factions in `factions` become actors; `true` by default (spec 055). */
  includeFactionNpcs?: boolean;
  /** Extra NPCs for factions of the game. */
  npcs?: TacticalGameNpcRequest[];
  environmentFaction?: CreateEnvironmentFactionDto;
};

export type UpdateTacticalGameDto = Partial<
  Omit<
    TacticalGame,
    'id' | 'strategicGameId' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner' | 'environmentFaction'
  >
> & {
  /** Renames the environment, only while the game is `created`. */
  environmentFaction?: { name: string };
};

/** Modifiers an item of the character got in the game (spec 019). */
export type TacticalGameItemOutcome = {
  itemId: string;
  name: string;
  modifiers: StrategicItemModifier[];
};

/** Result of a finished tactical game for one character (NPCs are left out). */
export type TacticalGameCharacterOutcome = {
  actorId: string;
  characterId: string;
  name: string;
  /** `delta = end - start`. */
  hp: { start: number; end: number; delta: number };
  /** Every change of the hits in the game, by round (missing in older outcomes). */
  hpLog?: HpLogEntry[];
  /** Totals of `hpLog` by kind and by attacker. */
  hpBySource?: HpBySource;
  /** Final state of every injury of the actor. */
  injuries: Injury[];
  injuriesAdded: string[];
  injuriesUpdated: string[];
  injuriesHealed: string[];
  /** Dead, unconscious, permanently unconscious. */
  conditions: CharacterCondition[];
  /** Conditions the character brought into the game that ended in it (e.g. it woke up). */
  conditionsResolved?: string[];
  fate?: CharacterFate;
  /** Lasting breakage the items of the character got in the game (spec 019). */
  items?: TacticalGameItemOutcome[];
  /** Set once the result has been applied to the strategic character. */
  appliedAt?: string;
  /** Error of the last attempt to apply it. */
  error?: string;
};

export type TacticalGameOutcome = {
  finishedAt: string;
  appliedAt?: string;
  characters: TacticalGameCharacterOutcome[];
};

/** A character who bleeds or is dying at the end of the game: finishing needs a fate for it. */
export type AtRiskCharacter = {
  actorId: string;
  characterId: string;
  name: string;
  /** Hits per round of the injuries that still bleed (0 when it is only dying). */
  bleeding: number;
  /** Rounds left of the `dying` effect, when there is one. */
  dyingRounds?: number;
};

/** `GET v1/tactical-games/:id/finish-preview`. */
export type FinishPreview = {
  gameId: string;
  characters: TacticalGameCharacterOutcome[];
  atRisk: AtRiskCharacter[];
};

/** `POST v1/tactical-games/:id/finish`: a fate for every character at risk. */
export type FinishTacticalGameDto = {
  fates: { actorId: string; fate: CharacterFate }[];
};
