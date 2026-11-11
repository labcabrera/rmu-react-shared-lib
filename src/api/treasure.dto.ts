import type { MagicItemRequest } from './magic-item.dto';
import type { ItemHolder, StrategicItem } from './strategic-item.dto';
import type { TreasureQuality } from './treasure-tables.dto';

// Random treasure of Treasure Law 7.1 (workspace spec 067): `POST v1/treasure/rolls` and `POST v1/treasure/awards`
// of rmu-api-strategic. Gold amounts in gold pieces.

/** Body of `POST v1/treasure/rolls`: the book codes ("c, n, x") or explicit qualities, and the dice. */
export type TreasureRollRequest = {
  codes?: string | null;
  wealth?: TreasureQuality[];
  lifestyle?: TreasureQuality[];
  magic?: TreasureQuality[];
  /** Sum of the 7-1c modifiers. */
  wealthModifier?: number;
  /** For the power level of the campaign. */
  gameId?: string | null;
  /** The dice rolled in the client so far, in order (workspace spec 094). */
  dice?: number[];
};

/** The next die the client has to roll: the table it reads, its range and the modifier the API adds to it. */
export type TreasurePendingRoll = { table: string; min: number; max: number; modifier: number };

/** One roll of the treasure: table, d100, modifier, total and the row it gave. */
export type TreasureDie = { table: string; roll: number; modifier: number; total: number; result: string };

export type TreasureGoldLine = { kind: 'gold'; gold: number; dice: TreasureDie[] };

export type TreasureItemLine = {
  kind: 'item';
  itemTypeId: string;
  name: string;
  amount: number | null;
  /** Gold of one unit. */
  value: number;
  carats?: number | null;
  jewelryClass?: string | null;
  magic?: MagicItemRequest | null;
  dice: TreasureDie[];
};

/** Lifestyle, unresolved and special results. */
export type TreasureNoteLine = { kind: 'note'; text: string; dice: TreasureDie[] };

export type TreasureLine = TreasureGoldLine | TreasureItemLine | TreasureNoteLine;

/** What `POST v1/treasure/rolls` answers; nothing is stored. */
export type TreasureRoll = {
  codes: { wealth: TreasureQuality[]; lifestyle: TreasureQuality[]; magic: TreasureQuality[] };
  lines: TreasureLine[];
  warnings: string[];
  /** Another die is needed: send it with the previous ones. The treasure is complete without it. */
  pending?: TreasurePendingRoll;
};

/** Body of `POST v1/treasure/awards`: the lines the game master keeps, for a holder of the game. */
export type TreasureAwardDto = { gameId: string; holder: ItemHolder; lines: TreasureLine[] };

/** The items created and the gold added. */
export type TreasureAwardResult = { items: StrategicItem[]; gold: number };

/** Whether a line can be awarded: notes are only shown. */
export const isAwardableTreasureLine = (line: TreasureLine): boolean => line.kind !== 'note';
