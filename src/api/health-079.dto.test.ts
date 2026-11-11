import { describe, expect, it } from 'vitest';
import {
  AMPUTATION_DIFFICULTY,
  canTryRevive,
  isLimbLost,
  REVIVE_DIFFICULTY,
  SOUL_DEPARTURE_ROUNDS,
} from './health-079.dto';
import { PASS_TIME_ACTIVITIES } from './strategic-game.dto';

describe('spec 079, block C health contracts', () => {
  it('finds a limb lost already', () => {
    const lost = [{ location: 'arm' as const, side: 'left' as const, at: '2026-11-05T00:00:00.000Z' }];
    expect(isLimbLost(lost, 'arm', 'left')).toBe(true);
    expect(isLimbLost(lost, 'arm', 'right')).toBe(false);
    expect(isLimbLost(undefined, 'leg', 'left')).toBe(false);
  });

  it('allows a revival only while the soul is there', () => {
    expect(canTryRevive({ deathRound: 3, soulRoundsLeft: SOUL_DEPARTURE_ROUNDS })).toBe(true);
    expect(canTryRevive({ deathRound: 3, soulRoundsLeft: 0 })).toBe(false);
    expect(canTryRevive({ deathRound: null, soulRoundsLeft: null })).toBe(false);
  });

  it('keeps the difficulties of the procedures and the active activity', () => {
    expect(AMPUTATION_DIFFICULTY).toEqual({ surgical: -50, emergency: -30 });
    expect(REVIVE_DIFFICULTY).toEqual({ respiratory: -50, cardiac: -100 });
    expect(PASS_TIME_ACTIVITIES).toContain('active');
  });
});
