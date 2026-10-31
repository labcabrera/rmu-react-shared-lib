import React from 'react';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { creatureSizeClass, npcAttackNotation } from '../../api/npc.dto';
import { renderWithProviders } from '../../test/render';
import CreatureStatBlock, { additionalCriticalLabel, biomeLabel } from './CreatureStatBlock';
import { sampleCreature } from './creature-fixture';

// Without an i18n instance `t` returns the key, or the defaultValue when one is given.
const t = (key: string, options?: Record<string, unknown>) =>
  options?.biome ? `${key}[${options.biome}]` : ((options?.defaultValue as string) ?? key);

describe('CreatureStatBlock', () => {
  it('shows the level, size and critical codes as chips', () => {
    renderWithProviders(<CreatureStatBlock npc={sampleCreature} />);

    expect(screen.getByText('npc-level-with-spread')).toBeInTheDocument();
    expect(screen.getByText('outlook-hungry')).toBeInTheDocument();
    expect(screen.getByText('npc-archetype-offensive')).toBeInTheDocument();
    expect(screen.getByText('size-big (6)')).toBeInTheDocument();
    expect(screen.getByText('npc-critical-size-value')).toBeInTheDocument();
    expect(screen.getByText('npc-crit-reduce-severity')).toBeInTheDocument();
    expect(screen.getByText('npc-crit-stun-immune')).toBeInTheDocument();
    expect(screen.queryByText('npc-crit-no-knockdown')).not.toBeInTheDocument();
    expect(screen.getByText('npc-immunity-no-slash')).toBeInTheDocument();
  });

  it('shows hits with death hits, AT/DB, running and power points', () => {
    renderWithProviders(<CreatureStatBlock npc={sampleCreature} />);

    expect(screen.getByText('120 (150)')).toBeInTheDocument();
    expect(screen.getByText('4 / 20')).toBeInTheDocument();
    expect(screen.getByText('5 / +40')).toBeInTheDocument();
    expect(screen.getByText('npc-pp')).toBeInTheDocument();
  });

  it('shows the shield type with its DB and the Shield skill (ADR 0010)', () => {
    const { unmount } = renderWithProviders(
      <CreatureStatBlock npc={{ ...sampleCreature, shield: { type: 'normal', db: 20, ranks: 8, bonus: 60 } }} />
    );
    expect(screen.getByText('npc-shield-type-normal +20')).toBeInTheDocument();
    expect(screen.getByText('8 / +60')).toBeInTheDocument();
    unmount();

    // Stored before spec 056: the DB of its type, and no skill without ranks or bonus.
    renderWithProviders(
      <CreatureStatBlock npc={{ ...sampleCreature, shield: { type: 'full', ranks: null, bonus: null } }} />
    );
    expect(screen.getByText('npc-shield-type-full +25')).toBeInTheDocument();
    expect(screen.queryByText('npc-shield-skill')).not.toBeInTheDocument();
  });

  it('shows one row per attack with its table, notation and extras', () => {
    renderWithProviders(<CreatureStatBlock npc={sampleCreature} />);

    const attacks = screen.getAllByTestId('creature-attack');
    expect(attacks).toHaveLength(2);
    expect(within(attacks[0]).getByText('bite')).toBeInTheDocument();
    expect(within(attacks[0]).getByText('60B(6)bi>')).toBeInTheDocument();
    expect(within(attacks[0]).getByText('npc-attack-sequence-single')).toBeInTheDocument();
    expect(within(attacks[1]).getByText('npc-attack-additional-critical')).toBeInTheDocument();
    expect(within(attacks[1]).getByText('npc-attack-cooperation')).toBeInTheDocument();
    expect(within(attacks[1]).getByText('npc-attack-alternative')).toBeInTheDocument();
    expect(within(attacks[1]).getByText('npc-attack-poison: nerve -10')).toBeInTheDocument();
  });

  it('shows movement, the five RRs, skills and the encounter', () => {
    renderWithProviders(<CreatureStatBlock npc={sampleCreature} />);

    expect(screen.getByText('npc-movement-walk-quadruped')).toBeInTheDocument();
    expect(screen.getByText('npc-movement-wings II')).toBeInTheDocument();
    ['channeling', 'essence', 'mentalism', 'physical', 'fear'].forEach((rr) =>
      expect(screen.getByText(rr)).toBeInTheDocument()
    );
    expect(screen.getByText('perception')).toBeInTheDocument();
    expect(screen.getByText('npc-skill-ranks · Sample note')).toBeInTheDocument();
    expect(screen.getByText('Pack (1d6)')).toBeInTheDocument();
    expect(screen.getByText('npc-biome-F')).toBeInTheDocument();
    expect(screen.getByText('npc-biome-water')).toBeInTheDocument();
  });

  it('shows empty texts and hides panels', () => {
    renderWithProviders(
      <CreatureStatBlock
        npc={{ ...sampleCreature, attacks: [], movement: [], resistances: null, encounter: null }}
        hide={['skills']}
      />
    );

    expect(screen.getByText('npc-no-attacks')).toBeInTheDocument();
    expect(screen.getByText('npc-no-movement')).toBeInTheDocument();
    expect(screen.getByText('npc-no-resistances')).toBeInTheDocument();
    expect(screen.queryByText('perception')).not.toBeInTheDocument();
    expect(screen.queryByText('npc-encounter')).not.toBeInTheDocument();
  });
});

describe('creature helpers', () => {
  it('labels biomes, water biomes and additional criticals', () => {
    expect(biomeLabel('F', t)).toBe('npc-biome-F');
    expect(biomeLabel('Fw', t)).toBe('npc-biome-water[npc-biome-F]');
    expect(additionalCriticalLabel('krush', t)).toBe('krush');
    expect(additionalCriticalLabel('unknown', t)).toBe('unknown');
  });

  it('builds the notation preview of an attack', () => {
    expect(creatureSizeClass('medium')).toBe(5);
    expect(creatureSizeClass('nope')).toBeNull();
    expect(npcAttackNotation({ ob: 23, size: 6, attackTable: 'bite' })).toBe('23B(6)bi');
    expect(npcAttackNotation({ ob: -3, size: 1, attackTable: 'bite', cooperation: 100 })).toBe('-3MI(1)bi(Coop100)');
    expect(
      npcAttackNotation({ ob: 10, size: 5, attackTable: 'grapple', additionalCritical: 'krush', sequence: 'double' })
    ).toBe('10M(5)gr[Krush]>>');
    expect(
      npcAttackNotation({ ob: 5, size: 4, attackTable: 'grapple', poison: { type: 'nerve', rrModifier: -20 } })
    ).toBe('5S(4)gr [Poison, Nerve, -20]');
    expect(npcAttackNotation({ ob: 40, size: 5, attackTable: 'broadsword', hand: 'left' })).toBe(
      '40M(5)broadsword(Left)'
    );
  });
});
