import { describe, expect, it } from 'vitest';
import { HAZARD_KINDS } from './combat-core-law.dto';
import { SENSE_SELECTIONS } from './combat-talents.dto';
import {
  breathLimitRounds,
  breathRoundsLeft,
  FOG_TABLE,
  lightAtDistance,
  temperatureSeverity,
} from './environment-079.dto';

describe('spec 079, block C environment contracts', () => {
  it('reads Table 15-3 as the tactical API', () => {
    expect(temperatureSeverity(-49)).toBeNull();
    expect(temperatureSeverity(-80)).toEqual({ kind: 'cold', severity: 'B' });
    expect(temperatureSeverity(-251)).toEqual({ kind: 'cold', severity: 'I' });
    expect(temperatureSeverity(100)).toBeNull();
    expect(temperatureSeverity(180)).toEqual({ kind: 'heat', severity: 'B' });
    expect(temperatureSeverity(801)).toEqual({ kind: 'heat', severity: 'F' });
    expect(temperatureSeverity(99999)).toEqual({ kind: 'heat', severity: 'J' });
    expect(temperatureSeverity(null)).toBeNull();
  });

  it('holds the breath 12 + Co prepared, the bonus alone unprepared, at least 1', () => {
    expect(breathLimitRounds(true, 5)).toBe(17);
    expect(breathLimitRounds(false, 5)).toBe(5);
    expect(breathLimitRounds(false, -10)).toBe(1);
    expect(breathRoundsLeft({ heldRounds: 3, limitRounds: 5 })).toBe(2);
    expect(breathRoundsLeft({ heldRounds: 7, limitRounds: 5 })).toBe(0);
  });

  it('gives the light of a source at a distance, one level darker per band', () => {
    expect(lightAtDistance('torch', 10)).toBe('medium_shadows');
    expect(lightAtDistance('torch', 25)).toBe('heavy_shadows');
    expect(lightAtDistance('torch', 100)).toBe('dark');
    expect(lightAtDistance('torch', 300)).toBe('extremely_dark');
    expect(lightAtDistance('torch', 301)).toBeNull();
    expect(lightAtDistance('torch', 301, 'dark')).toBe('dark');
    expect(lightAtDistance('candle', 5)).toBe('heavy_shadows');
    expect(lightAtDistance('bonfire', 50)).toBe('heavy_shadows');
    // The brighter of the source and the ambient light
    expect(lightAtDistance('candle', 5, 'no_shadows')).toBe('no_shadows');
    expect(lightAtDistance('torch', -1)).toBeNull();
  });

  it('keeps the fog of Table 15-7 and the new hazard and sense selection', () => {
    expect(Object.values(FOG_TABLE).map((level) => level.perception)).toEqual([-15, -25, -50, -75]);
    expect(HAZARD_KINDS).toContain('extreme-temperature');
    expect(SENSE_SELECTIONS).toContain('beyond-visual-range');
  });
});
