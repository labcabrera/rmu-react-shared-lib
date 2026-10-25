/** Which way an open-ended roll opens: 96-100 rolls again and adds (`high`), 01-05 rolls again and subtracts (`low`). */
export type OpenEnded = 'none' | 'high' | 'low' | 'both';

/**
 * How a roll is made (spec 025): `dice` dice of `sides` sides, summed, plus `modifier`. Open-ended rolls are a single
 * d100.
 */
export interface RollSpec {
  dice: number;
  sides: number;
  openEnded: OpenEnded;
  modifier?: number;
}

/** A roll: the total, every die in order and the unmodified roll (the first die, or the sum of several dice). */
export interface RollValue {
  total: number;
  rolls: number[];
  unmodified: number;
}

/** Where a chain of dice stands. */
export interface RollChain {
  /** Every die the roll needs is there. */
  complete: boolean;
  /** The total, once complete. */
  total?: number;
  /** +1 when the next die adds, -1 when it subtracts. */
  nextSign: 1 | -1;
}
