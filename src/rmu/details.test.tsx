import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import KeyValuePanel from '../display/KeyValuePanel';
import { sampleCharacter } from '../test/fixtures/character';
import { renderWithProviders } from '../test/render';
import BonusDevPointsSummary from './character/BonusDevPointsSummary';
import SituationalSenseTraits, { senseTraitsOf } from './character/SituationalSenseTraits';
import StatBonusGrid from './character/StatBonusGrid';
import TraitTypeChip from './trait/TraitTypeChip';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('StatBonusGrid', () => {
  it('shows the given stats with signed bonuses and skips the missing ones', () => {
    renderWithProviders(<StatBonusGrid stats={{ ag: 2, co: -3, em: 0 }} />);
    expect(screen.getByText('AG')).toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
    expect(screen.getByText('-3')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('ag')).toBeInTheDocument();
    expect(screen.queryByText('QU')).not.toBeInTheDocument();
  });

  it('hides the full stat names when dense', () => {
    renderWithProviders(<StatBonusGrid stats={{ ag: 2 }} dense />);
    expect(screen.getByText('AG')).toBeInTheDocument();
    expect(screen.queryByText('ag')).not.toBeInTheDocument();
  });
});

describe('KeyValuePanel', () => {
  const rows = [
    { label: 'Height', value: '6.5', hint: 'male' },
    { label: 'Weight', value: '250' },
  ];

  it('renders the rows inside a titled panel', () => {
    renderWithProviders(<KeyValuePanel title="Physical" rows={rows} />);
    expect(screen.getByText('Physical')).toBeInTheDocument();
    expect(screen.getByText('Height')).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();
    expect(screen.getByText('250')).toBeInTheDocument();
  });

  it('renders the rows bare without a title', () => {
    const { container } = renderWithProviders(<KeyValuePanel rows={rows} />);
    expect(container.querySelector('.MuiCard-root')).toBeNull();
    expect(container.querySelectorAll('dt')).toHaveLength(2);
  });
});

describe('TraitTypeChip', () => {
  it('shows an icon and the type name', () => {
    const { container, rerender } = renderWithProviders(<TraitTypeChip isTalent />);
    expect(screen.getByText('talent')).toBeInTheDocument();
    expect(container.querySelector('.MuiChip-icon')).not.toBeNull();
    rerender(<TraitTypeChip isTalent={false} />);
    expect(screen.getByText('flaw')).toBeInTheDocument();
  });
});

describe('BonusDevPointsSummary', () => {
  it('renders nothing without bonus or flaw points', () => {
    const { container } = renderWithProviders(<BonusDevPointsSummary character={sampleCharacter} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the bonus points with the level limit and the flaw points', () => {
    const character = {
      ...sampleCharacter,
      experience: {
        ...sampleCharacter.experience,
        availableBonusDevPoints: 12,
        bonusDevPointsSpentThisLevel: 4,
        flawDevPoints: 6,
      },
    };
    const { rerender } = renderWithProviders(<BonusDevPointsSummary character={character} />);
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText(/\/ 25/)).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
    rerender(<BonusDevPointsSummary character={character} limit={10} />);
    expect(screen.getByText(/\/ 10/)).toBeInTheDocument();
    expect(screen.queryByText(/saved-dev-points/)).not.toBeInTheDocument();
  });

  it('shows the points saved at the last level up (spec 076)', () => {
    const character = { ...sampleCharacter, experience: { ...sampleCharacter.experience, savedDevPoints: 7 } };
    renderWithProviders(<BonusDevPointsSummary character={character} />);
    expect(screen.getByText(/saved-dev-points:/)).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});

describe('SituationalSenseTraits (spec 076)', () => {
  const trait = (traitId: string, tier?: number) => ({
    traitId,
    traitName: traitId,
    isTalent: true,
    tier,
    cost: 0,
    specialization: undefined,
  });
  const traits = [trait('acute-hearing', 2), trait('nightvision'), trait('lucky', 1)];

  it('keeps only the sense traits', () => {
    expect(senseTraitsOf(traits).map((t) => t.traitId)).toEqual(['acute-hearing', 'nightvision']);
    expect(senseTraitsOf(undefined)).toEqual([]);
  });

  it('lists them on Perception as situational', () => {
    renderWithProviders(<SituationalSenseTraits skill={{ skillId: 'perception' }} traits={traits} />);
    expect(screen.getByText('situational-sense-traits')).toBeInTheDocument();
    expect(screen.getByText('acute-hearing II')).toBeInTheDocument();
    expect(screen.getByText('nightvision')).toBeInTheDocument();
    expect(screen.queryByText(/lucky/)).not.toBeInTheDocument();
  });

  it('renders nothing on other skills or without sense traits', () => {
    const { container, rerender } = renderWithProviders(
      <SituationalSenseTraits skill={{ skillId: 'jump' }} traits={traits} />
    );
    expect(container).toBeEmptyDOMElement();
    rerender(<SituationalSenseTraits skill={{ skillId: 'perception' }} traits={[trait('lucky', 1)]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
