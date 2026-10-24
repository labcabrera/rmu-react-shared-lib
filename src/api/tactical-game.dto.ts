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
  factions: string[];
  actors: ActorRoundSelection[];
  environment: TacticalGameEnvironment;
  description: string;
  owner: string;
  imageUrl?: string;
  /** Result of the game, set when it is finished. */
  outcome?: TacticalGameOutcome;
};

export type ActorRoundSelection = {
  id: string;
  actorId: string;
};

export type TacticalGameEnvironment = {
  temperatureFatigueModifier: number;
  altitudeFatigueModifier: number;
};

export type CreateTacticalGameDto = Omit<
  TacticalGame,
  'id' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner'
>;

export type UpdateTacticalGameDto = Partial<
  Omit<TacticalGame, 'id' | 'strategicGameId' | 'status' | 'round' | 'phase' | 'factions' | 'actors' | 'owner'>
>;

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
