import { RollChain, RollSpec, RollValue } from './roll.types';

const HIGH_FROM = 96;
const LOW_TO = 5;
/** Guard against a broken random source in an open-ended chain. */
const MAX_DICE = 50;

/** A random die of `sides` sides, 1 to `sides`. */
export const randomDie = (sides: number): number => Math.floor(Math.random() * sides) + 1;

const isOpen = (spec: RollSpec) => spec.openEnded !== 'none' && spec.dice === 1 && spec.sides === 100;
const opensHigh = (spec: RollSpec, first: number) =>
  isOpen(spec) && first >= HIGH_FROM && (spec.openEnded === 'high' || spec.openEnded === 'both');
const opensLow = (spec: RollSpec, first: number) =>
  isOpen(spec) && first <= LOW_TO && (spec.openEnded === 'low' || spec.openEnded === 'both');

/**
 * Where the dice of a roll stand. A closed roll is complete with `dice` dice. An open-ended one opens with a first die
 * of 96-100 (adds) or 01-05 (subtracts), and each extra die of 96-100 asks for another one, which keeps adding or
 * subtracting.
 */
export function resolveChain(spec: RollSpec, rolls: number[]): RollChain {
  const modifier = spec.modifier ?? 0;
  const first = rolls[0];
  if (first === undefined) return { complete: false, nextSign: 1 };
  if (!opensHigh(spec, first) && !opensLow(spec, first)) {
    if (rolls.length < spec.dice) return { complete: false, nextSign: 1 };
    const sum = rolls.slice(0, spec.dice).reduce((total, die) => total + die, 0);
    return { complete: true, total: sum + modifier, nextSign: 1 };
  }
  const sign = opensHigh(spec, first) ? 1 : -1;
  const rest = rolls.slice(1);
  const last = rest[rest.length - 1];
  if (last === undefined || last >= HIGH_FROM) return { complete: false, nextSign: sign };
  return { complete: true, total: first + sign * rest.reduce((total, die) => total + die, 0) + modifier, nextSign: sign };
}

/** The unmodified roll: the first die, or the sum of the dice of a roll of several dice. */
const unmodifiedOf = (spec: RollSpec, rolls: number[]) =>
  spec.dice > 1 ? rolls.slice(0, spec.dice).reduce((total, die) => total + die, 0) : rolls[0];

/** The value of a complete chain of dice, or undefined while a die is missing. */
export function toRollValue(spec: RollSpec, rolls: number[]): RollValue | undefined {
  const chain = resolveChain(spec, rolls);
  if (!chain.complete || chain.total === undefined) return undefined;
  return { total: chain.total, rolls: [...rolls], unmodified: unmodifiedOf(spec, rolls) };
}

/** Rolls every die the roll needs. `random` is the die, for tests. */
export function rollDice(spec: RollSpec, random: (sides: number) => number = randomDie): RollValue {
  const rolls: number[] = [];
  let value = toRollValue(spec, rolls);
  while (!value && rolls.length < MAX_DICE) {
    rolls.push(random(spec.sides));
    value = toRollValue(spec, rolls);
  }
  if (!value) throw new Error(`The roll did not end after ${MAX_DICE} dice`);
  return value;
}

/** Digits of a die as it is read at the table: one for a d10 ("0" is 10), two for a d100 ("00" is 100). */
export const dieDigits = (sides: number): number => String(sides - 1).length;

/**
 * The value of a die typed as at the table: "0" is 10 on a d10 and "00" is 100 on a d100; "05" is 5. Undefined when
 * the text is not a die of `sides` sides.
 */
export function readDie(text: string, sides: number): number | undefined {
  if (!/^\d+$/.test(text) || text.length > dieDigits(sides)) return undefined;
  const value = Number(text);
  if (value === 0) return text.length === dieDigits(sides) ? sides : undefined;
  return value <= sides ? value : undefined;
}

const pad = (die: number, sides: number) => (sides === 100 && die < 10 ? `0${die}` : String(die));

/**
 * A roll as it is shown: the total, and its dice when there are several: `142 (97+45)`, `-87 (03−90)`, `13 (6+7)`.
 */
export function formatRoll(value: RollValue, spec: RollSpec): string {
  if (value.rolls.length <= 1) return String(value.total);
  const subtracts = isOpen(spec) && opensLow(spec, value.rolls[0]);
  const dice = value.rolls.map((die) => pad(die, spec.sides)).join(subtracts ? '−' : '+');
  return `${value.total} (${dice})`;
}

/**
 * A total stored without its dice as a roll of one die, when it is a complete roll of one die of the spec; undefined
 * otherwise (an open-ended total over 100, a 2d10 total...).
 */
export function fromNumber(spec: RollSpec, total: number): RollValue | undefined {
  const die = total - (spec.modifier ?? 0);
  if (!Number.isInteger(die) || die < 1 || die > spec.sides) return undefined;
  return toRollValue(spec, [die]);
}
