import { describe, expect, it } from 'vitest';
import { obMargin } from './ob-margin';

const twoWeapons = [
  { attackName: 'mainHand', currentBo: 100 },
  { attackName: 'offHand', currentBo: 80 },
];
const attack = (attackName: string, bo: number) => ({ attackName, bo });

describe('obMargin', () => {
  it('takes the least left with several attacks', () => {
    expect(obMargin(twoWeapons, [attack('mainHand', 70), attack('offHand', 50)])).toBe(30);
    expect(obMargin(twoWeapons, [attack('mainHand', 100), attack('offHand', 50)])).toBe(0);
  });

  it('spends from the best OB with one attack', () => {
    expect(obMargin(twoWeapons, [attack('mainHand', 60)])).toBe(40);
    expect(obMargin(twoWeapons, [attack('offHand', 60)])).toBe(40);
  });

  it('does not count the attacks at 0 as used', () => {
    expect(obMargin(twoWeapons, [attack('mainHand', 60), attack('offHand', 0)])).toBe(40);
  });

  it('is null when the action spends no OB', () => {
    expect(obMargin(twoWeapons, [])).toBeNull();
    expect(obMargin(twoWeapons, [attack('mainHand', 0)])).toBeNull();
  });

  it('is never negative', () => {
    expect(obMargin(twoWeapons, [attack('mainHand', 120)])).toBe(0);
  });
});
