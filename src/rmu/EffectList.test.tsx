import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import EffectList from './EffectList';

describe('EffectList', () => {
  it('shows the most severe effects first', () => {
    renderWithProviders(
      <EffectList
        effects={[
          { status: 'bleeding', value: 4 },
          { status: 'stunned', value: -25 },
        ]}
      />
    );

    const labels = screen.getAllByText(/bleeding|stunned/).map((element) => element.textContent);
    expect(labels).toEqual(['stunned -25', 'bleeding 4']);
  });

  it('sums the penalties in one chip and hides empty ones', () => {
    renderWithProviders(
      <EffectList
        effects={[{ status: 'penalty', value: 0 }]}
        penalties={[
          { source: 'hp', value: -50 },
          { source: 'critical', value: -5 },
        ]}
      />
    );

    expect(screen.getByText('penalty -55')).toBeInTheDocument();
    expect(screen.queryByText('penalty 0')).not.toBeInTheDocument();
  });

  it('shows solid chips and bleeding in red, like the hit points it takes', () => {
    renderWithProviders(<EffectList effects={[{ status: 'bleeding', value: 3 }, { status: 'fatigue' }]} />);

    const bleeding = screen.getByText('bleeding 3').closest('.MuiChip-root')!;
    const fatigue = screen.getByText('fatigue').closest('.MuiChip-root')!;
    expect(bleeding).toHaveClass('MuiChip-colorError', 'MuiChip-filled');
    expect(fatigue).toHaveClass('MuiChip-colorWarning', 'MuiChip-filled');
  });

  it('shows compact badges with the full text for screen readers', () => {
    renderWithProviders(
      <EffectList
        variant="compact"
        effects={[{ status: 'stunned', value: -25, rounds: 2 }]}
        penalties={[{ source: 'hp', value: -10 }]}
      />
    );

    expect(screen.getByRole('button', { name: /^stunned -25/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'penalty -10' })).toBeInTheDocument();
  });

  it('renders nothing without effects or penalties', () => {
    const { container } = renderWithProviders(<EffectList effects={[]} penalties={[{ source: 'hp', value: 0 }]} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('EffectList legacy status', () => {
  it('reads the legacy unconcious as unconscious', () => {
    renderWithProviders(<EffectList effects={[{ status: 'unconcious' }, { status: 'unconscious' }]} />);

    const chips = screen.getAllByText('unconscious');
    expect(chips).toHaveLength(2);
    chips.forEach((chip) => expect(chip.closest('.MuiChip-root')).toHaveClass('MuiChip-colorError'));
  });
});
