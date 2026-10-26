import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SpellEffect } from '../api/spell.dto';
import { renderWithProviders } from '../test/render';
import SpellEffectList, { spellEffectSummary } from './SpellEffectList';
import { spellAreaText, spellDurationText, spellRangeText } from './spell/spell-format';

// Without an i18n instance `t` returns the key, or the defaultValue when one is given.
const t = (key: string, options?: Record<string, unknown>) => {
  const values = Object.entries(options || {})
    .filter(([name]) => name !== 'defaultValue')
    .map(([name, value]) => `${name}=${value}`);
  return values.length ? `${key}[${values.join(',')}]` : key;
};

describe('SpellEffectList', () => {
  it('shows one row per effect with its kind chip colored by group', () => {
    renderWithProviders(
      <SpellEffectList
        effects={[
          { kind: 'damage', appliesTo: 'target', requiresFailedRr: false, hits: 10 },
          { kind: 'heal', appliesTo: 'self', requiresFailedRr: false, hits: 5 },
          { kind: 'condition', appliesTo: 'target', requiresFailedRr: true, status: 'asleep' },
          { kind: 'modifier', appliesTo: 'self', requiresFailedRr: false, stat: 'db', value: 5 },
          { kind: 'narrative', appliesTo: 'self', requiresFailedRr: false, note: 'A sample note' },
        ]}
      />
    );

    expect(screen.getAllByTestId('spell-effect')).toHaveLength(5);
    expect(screen.getByText('spell-effect-kind-damage').closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    expect(screen.getByText('spell-effect-kind-heal').closest('.MuiChip-root')).toHaveClass('MuiChip-colorSuccess');
    expect(screen.getByText('spell-effect-kind-condition').closest('.MuiChip-root')).toHaveClass(
      'MuiChip-colorWarning'
    );
    expect(screen.getByText('spell-effect-kind-modifier').closest('.MuiChip-root')).toHaveClass('MuiChip-colorInfo');
    expect(screen.getByText('spell-effect-kind-narrative').closest('.MuiChip-root')).toHaveClass(
      'MuiChip-colorDefault'
    );
    expect(screen.getAllByText('spell-effect-requires-failed-rr')).toHaveLength(1);
    expect(screen.getByText('A sample note')).toBeInTheDocument();
  });

  it('shows the effect duration when it has one', () => {
    renderWithProviders(
      <SpellEffectList
        effects={[
          {
            kind: 'condition',
            appliesTo: 'target',
            requiresFailedRr: true,
            status: 'stunned',
            duration: {
              type: 'concentration',
              value: null,
              scale: null,
              perLevel: null,
              perFailure: null,
              concentration: true,
              raw: null,
            },
          },
        ]}
      />
    );

    expect(screen.getByText('concentration')).toBeInTheDocument();
  });

  it('shows the empty text without effects', () => {
    renderWithProviders(<SpellEffectList effects={[]} />);

    expect(screen.getByText('spell-no-effects')).toBeInTheDocument();
  });
});

describe('spellEffectSummary', () => {
  const summary = (effect: SpellEffect) => spellEffectSummary(effect, t);

  it('summarizes an attack with its table, size, OB and critical', () => {
    expect(
      summary({
        kind: 'attack',
        appliesTo: 'area',
        requiresFailedRr: false,
        attackTable: 'cold-ball',
        attackSize: 'small',
        criticalType: 'O',
        ob: 'list-ranks',
        radius: 10,
      })
    ).toBe(
      'spell-attack-table-cold-ball (small), spell-effect-ob-list-ranks, spell-effect-critical[type=O], spell-effect-radius[radius=10]'
    );
  });

  it('summarizes a critical relative to the one that triggers it', () => {
    const base = { kind: 'critical', appliesTo: 'target', requiresFailedRr: false, criticalType: 'holy' } as const;
    expect(summary({ ...base, severityOffset: -2 })).toBe(
      'spell-effect-critical[type=spell-critical-holy], spell-effect-critical-lower[count=2]'
    );
    expect(summary({ ...base, severityOffset: 0 })).toBe(
      'spell-effect-critical[type=spell-critical-holy], spell-effect-critical-same'
    );
    expect(summary({ ...base, criticalType: 'H', severity: 'C' })).toBe('spell-effect-critical[type=H C]');
  });

  it('summarizes a condition, a signed modifier and a heal', () => {
    expect(
      summary({
        kind: 'condition',
        appliesTo: 'target',
        requiresFailedRr: true,
        status: 'stunned',
        value: -25,
        rounds: 2,
      })
    ).toBe('spell-status-stunned -25 rounds-short[count=2]');
    expect(
      summary({
        kind: 'modifier',
        appliesTo: 'self',
        requiresFailedRr: false,
        stat: 'rr',
        value: 10,
        perLevel: true,
        filter: ['fear'],
      })
    ).toBe('spell-effect-stat-rr +10spell-per-level[count=1] (fear)');
    expect(
      summary({
        kind: 'heal',
        appliesTo: 'target',
        requiresFailedRr: false,
        hits: 20,
        bleeding: 3,
        injury: { types: ['bone'] },
      })
    ).toBe(
      'spell-effect-heal-hits[value=20], spell-effect-heal-bleeding[value=3], spell-effect-heal-injury-detail[detail=injury-type-bone]'
    );
  });

  it('summarizes an affliction with its periodic effects', () => {
    expect(
      summary({
        kind: 'afflict',
        appliesTo: 'target',
        requiresFailedRr: true,
        afflictionType: 'poison',
        severity: 'light',
        effects: [{ kind: 'damage', hits: 3 }],
      })
    ).toBe('spell-affliction-poison spell-severity-light, spell-effect-periodic[effects=spell-effect-hits[value=3]]');
  });

  it('names the injury types and afflictions a cure removes', () => {
    expect(
      summary({ kind: 'cure', appliesTo: 'target', requiresFailedRr: false, removes: ['curse', 'organ', 'asleep'] })
    ).toBe('spell-effect-removes[list=spell-affliction-curse, injury-type-organ, spell-status-asleep]');
  });
});

describe('spell format', () => {
  it('builds the duration from its fields and falls back to the raw text', () => {
    const duration = {
      value: 1,
      scale: 'minute',
      perLevel: 1,
      perFailure: null,
      concentration: false,
      raw: 'x',
    } as const;
    expect(spellDurationText({ ...duration, type: 'per-level' }, t)).toBe(
      '1 spell-scale-minute[count=1]spell-per-level[count=1]'
    );
    expect(spellDurationText({ ...duration, type: 'fixed', concentration: true }, t)).toBe(
      '1 spell-scale-minute[count=1] (C)'
    );
    expect(spellDurationText({ ...duration, type: 'fixed', value: null }, t)).toBe('x');
    expect(spellDurationText(null, t)).toBe('-');
  });

  it('builds the range and the area', () => {
    expect(spellRangeText({ type: 'distance', value: 100, perLevel: false, increment: 25, raw: null }, t)).toBe(
      "100' <25'>"
    );
    expect(spellRangeText({ type: 'varies', value: null, perLevel: false, increment: null, raw: 'special' }, t)).toBe(
      'special'
    );
    expect(
      spellAreaText(
        {
          kind: 'targets',
          count: 1,
          perLevel: true,
          radius: null,
          dimensions: null,
          targetTypes: ['person'],
          raw: null,
        },
        t
      )
    ).toBe('1spell-per-level[count=1] spell-target-type-person');
    expect(
      spellAreaText(
        { kind: 'radius', count: null, perLevel: false, radius: 20, dimensions: null, targetTypes: [], raw: null },
        t
      )
    ).toBe("20' R");
  });
});
