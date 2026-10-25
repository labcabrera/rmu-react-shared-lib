import { RollSpec } from './roll.types';

/** Closed d100, 1 to 100. */
export const D100: RollSpec = { dice: 1, sides: 100, openEnded: 'none' };
/** Open-ended d100 both ways, the default open-ended roll. */
export const OPEN_D100: RollSpec = { dice: 1, sides: 100, openEnded: 'both' };
export const HIGH_OPEN_D100: RollSpec = { dice: 1, sides: 100, openEnded: 'high' };
export const LOW_OPEN_D100: RollSpec = { dice: 1, sides: 100, openEnded: 'low' };
export const D10: RollSpec = { dice: 1, sides: 10, openEnded: 'none' };
/** 2d10, the initiative roll. */
export const TWO_D10: RollSpec = { dice: 2, sides: 10, openEnded: 'none' };
