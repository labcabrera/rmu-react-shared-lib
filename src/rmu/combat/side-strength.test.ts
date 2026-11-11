import { describe, expect, it } from 'vitest';
import { sideStrength, SideStrengthActor, standingShare } from './side-strength';

// Same cases as side-strength.ts in the tactical API (spec 100, "Casos de prueba comunes").

const actor = (level: number, statuses: string[] = [], factionId = 'maela'): SideStrengthActor => ({
  factionId,
  level,
  hp: { max: 10 * level, current: 10 * level },
  effects: statuses.map((status) => ({ status })),
});

const SIDES = [{ id: 'company', factionIds: ['maela'] }];

describe('sideStrength', () => {
  it("counts Maela's company with Maela dead and a soldier unconscious", () => {
    const [strength] = sideStrength(
      [actor(8, ['dead']), actor(4), actor(2, ['unconscious']), actor(2), actor(2)],
      SIDES
    );
    expect(strength).toMatchObject({
      sideId: 'company',
      totalLevels: 18,
      standingLevels: 8,
      incapacitatedLevels: 10,
      fledLevels: 0,
      totalCount: 5,
      standingCount: 3,
      incapacitatedCount: 2,
      fledCount: 0,
    });
    expect(Math.round(standingShare(strength) * 100)).toBe(44);
  });

  it('takes a routed soldier as fled, and the legacy unconcious as incapacitated', () => {
    const [strength] = sideStrength(
      [actor(8, ['dead']), actor(4), actor(2, ['unconcious']), actor(2, ['fear-routed']), actor(2)],
      SIDES
    );
    expect(strength).toMatchObject({ standingLevels: 6, incapacitatedLevels: 10, fledLevels: 2, fledCount: 1 });
  });

  it('reads incapacitated before fled', () => {
    const [strength] = sideStrength([actor(3, ['fear-broken', 'paralyzed'])], SIDES);
    expect(strength).toMatchObject({ incapacitatedLevels: 3, fledLevels: 0 });
  });

  it('counts an absent or 0 level as 1', () => {
    const [strength] = sideStrength(
      [{ factionId: 'maela', level: 0 }, { factionId: 'maela' }, { factionId: 'maela', level: null }],
      SIDES
    );
    expect(strength.totalLevels).toBe(3);
    expect(strength.standingLevels).toBe(3);
  });

  it('adds 0 for negative hit points and counts the hit points of the fallen', () => {
    const [strength] = sideStrength(
      [
        { factionId: 'maela', level: 1, hp: { max: 30, current: -5 }, effects: [{ status: 'dead' }] },
        { factionId: 'maela', level: 1, hp: { max: 20, current: 12 } },
        { factionId: 'maela', level: 1 },
      ],
      SIDES
    );
    expect(strength.hpCurrent).toBe(12);
    expect(strength.hpMax).toBe(50);
  });

  it('gives one strength per side, joining the factions of a side and leaving out the rest', () => {
    const strengths = sideStrength(
      [actor(2, [], 'a'), actor(3, [], 'b'), actor(5, [], 'c'), { level: 7 }, actor(9, [], 'unknown')],
      [
        { id: 'allies', factionIds: ['a', 'b'] },
        { id: 'enemies', factionIds: ['c'] },
        { id: 'empty', factionIds: [] },
      ]
    );
    expect(strengths.map((each) => [each.sideId, each.totalLevels, each.totalCount])).toEqual([
      ['allies', 5, 2],
      ['enemies', 5, 1],
      ['empty', 0, 0],
    ]);
    expect(standingShare(strengths[2])).toBe(0);
  });
});
