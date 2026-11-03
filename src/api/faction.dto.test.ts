import { describe, expect, it } from 'vitest';
import { canManageStrategic, canWriteStrategic, factionPlayerNames } from './faction.dto';

describe('faction players and access (spec 072)', () => {
  it('names the players in order, with their id when the name is unknown', () => {
    expect(factionPlayerNames({ players: ['a', 'b'], playerNames: { a: 'Ana' } })).toEqual(['Ana', 'b']);
    expect(factionPlayerNames({})).toEqual([]);
  });

  it('lets the masters and the players of the faction write, and only the masters manage', () => {
    expect(canWriteStrategic({ access: 'manage' })).toBe(true);
    expect(canWriteStrategic({ access: 'write' })).toBe(true);
    expect(canWriteStrategic({ access: 'read' })).toBe(false);
    expect(canWriteStrategic(undefined)).toBe(false);
    expect(canManageStrategic({ access: 'write' })).toBe(false);
    expect(canManageStrategic({ access: 'manage' })).toBe(true);
  });
});
