import { describe, expect, it } from 'vitest';
import { D10, D100, HIGH_OPEN_D100, LOW_OPEN_D100, OPEN_D100, TWO_D10 } from './presets';
import { dieDigits, formatRoll, fromNumber, readDie, resolveChain, rollDice, toRollValue } from './roll-logic';

const dice = (...values: number[]) => {
  const queue = [...values];
  return () => {
    const next = queue.shift();
    if (next === undefined) throw new Error('No more dice');
    return next;
  };
};

describe('resolveChain', () => {
  it('completes a closed roll with its dice', () => {
    expect(resolveChain(D100, [])).toEqual({ complete: false, nextSign: 1 });
    expect(resolveChain(D100, [98])).toEqual({ complete: true, total: 98, nextSign: 1 });
    expect(resolveChain(TWO_D10, [6])).toEqual({ complete: false, nextSign: 1 });
    expect(resolveChain(TWO_D10, [6, 7])).toEqual({ complete: true, total: 13, nextSign: 1 });
  });

  it('adds while the extra dice are 96-100 on a high open roll', () => {
    expect(resolveChain(OPEN_D100, [97])).toEqual({ complete: false, nextSign: 1 });
    expect(resolveChain(OPEN_D100, [97, 99])).toEqual({ complete: false, nextSign: 1 });
    expect(resolveChain(OPEN_D100, [97, 99, 40])).toEqual({ complete: true, total: 236, nextSign: 1 });
  });

  it('subtracts after 01-05, also the extra dice of 96-100', () => {
    expect(resolveChain(OPEN_D100, [3])).toEqual({ complete: false, nextSign: -1 });
    expect(resolveChain(OPEN_D100, [3, 98])).toEqual({ complete: false, nextSign: -1 });
    expect(resolveChain(OPEN_D100, [3, 98, 20])).toEqual({ complete: true, total: -115, nextSign: -1 });
  });

  it('opens only the configured side', () => {
    expect(resolveChain(HIGH_OPEN_D100, [3]).complete).toBe(true);
    expect(resolveChain(HIGH_OPEN_D100, [97]).complete).toBe(false);
    expect(resolveChain(LOW_OPEN_D100, [97]).complete).toBe(true);
    expect(resolveChain(LOW_OPEN_D100, [3]).complete).toBe(false);
  });

  it('adds the modifier', () => {
    expect(resolveChain({ ...TWO_D10, modifier: -1 }, [6, 7]).total).toBe(12);
  });
});

describe('rollDice', () => {
  it('rolls the dice the roll needs', () => {
    expect(rollDice(OPEN_D100, dice(97, 99, 40))).toEqual({ total: 236, rolls: [97, 99, 40], unmodified: 97 });
    expect(rollDice(OPEN_D100, dice(5, 96, 10))).toEqual({ total: -101, rolls: [5, 96, 10], unmodified: 5 });
    expect(rollDice(D100, dice(98))).toEqual({ total: 98, rolls: [98], unmodified: 98 });
    expect(rollDice(TWO_D10, dice(10, 3))).toEqual({ total: 13, rolls: [10, 3], unmodified: 13 });
  });

  it('passes the sides to the die', () => {
    const sides: number[] = [];
    rollDice(TWO_D10, (s) => {
      sides.push(s);
      return 1;
    });
    expect(sides).toEqual([10, 10]);
  });

  it('stays within the range of the dice with the default die', () => {
    for (let i = 0; i < 200; i++) {
      const roll = rollDice(D10);
      expect(roll.total).toBeGreaterThanOrEqual(1);
      expect(roll.total).toBeLessThanOrEqual(10);
    }
  });
});

describe('readDie', () => {
  it('reads a d10 with 0 as 10', () => {
    expect(dieDigits(10)).toBe(1);
    expect(readDie('0', 10)).toBe(10);
    expect(readDie('7', 10)).toBe(7);
    expect(readDie('10', 10)).toBeUndefined();
  });

  it('reads no zero on other dice', () => {
    expect(readDie('0', 6)).toBeUndefined();
    expect(readDie('6', 6)).toBe(6);
    expect(readDie('7', 6)).toBeUndefined();
  });

  it('reads a d100 with 00 as 100 and a leading zero', () => {
    expect(dieDigits(100)).toBe(2);
    expect(readDie('00', 100)).toBe(100);
    expect(readDie('05', 100)).toBe(5);
    expect(readDie('5', 100)).toBe(5);
    expect(readDie('45', 100)).toBe(45);
    expect(readDie('0', 100)).toBeUndefined();
    expect(readDie('100', 100)).toBeUndefined();
    expect(readDie('', 100)).toBeUndefined();
    expect(readDie('4a', 100)).toBeUndefined();
  });
});

describe('formatRoll', () => {
  it('shows the dice of an open roll and of several dice', () => {
    expect(formatRoll(toRollValue(OPEN_D100, [97, 45])!, OPEN_D100)).toBe('142 (97+45)');
    expect(formatRoll(toRollValue(OPEN_D100, [3, 90])!, OPEN_D100)).toBe('-87 (03−90)');
    expect(formatRoll(toRollValue(TWO_D10, [6, 7])!, TWO_D10)).toBe('13 (6+7)');
  });

  it('shows only the total of one die', () => {
    expect(formatRoll(toRollValue(OPEN_D100, [45])!, OPEN_D100)).toBe('45');
  });
});

describe('dice with a modifier', () => {
  it('rolls a d3 - 1 from 0 to 2', () => {
    const spec = { dice: 1, sides: 3, openEnded: 'none' as const, modifier: -1 };
    expect(rollDice(spec, dice(1))).toEqual({ total: 0, rolls: [1], unmodified: 1 });
    expect(fromNumber(spec, 2)).toEqual({ total: 2, rolls: [3], unmodified: 3 });
  });
});

describe('fromNumber', () => {
  it('keeps a total of one die as its die', () => {
    expect(fromNumber(D100, 45)).toEqual({ total: 45, rolls: [45], unmodified: 45 });
    expect(fromNumber(OPEN_D100, 45)).toEqual({ total: 45, rolls: [45], unmodified: 45 });
  });

  it('gives up on totals that need several dice', () => {
    expect(fromNumber(OPEN_D100, 142)).toBeUndefined();
    expect(fromNumber(OPEN_D100, 98)).toBeUndefined();
    expect(fromNumber(TWO_D10, 13)).toBeUndefined();
  });
});
