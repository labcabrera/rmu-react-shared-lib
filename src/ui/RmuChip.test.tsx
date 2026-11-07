import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import RmuChip from './RmuChip';

describe('RmuChip (spec 085)', () => {
  it('shows a rule outlined and an outcome or effect filled', () => {
    renderWithProviders(
      <>
        <RmuChip variant="rule" label="Big (+1)" />
        <RmuChip variant="outcome" tone="error" label="Damage 12" />
        <RmuChip variant="effect" tone="warning" label="Bleeding 2" />
      </>
    );
    const rule = screen.getByText('Big (+1)').closest('[data-variant]')!;
    expect(rule).toHaveAttribute('data-variant', 'rule');
    expect(rule.className).toMatch(/MuiChip-outlined/);
    const outcome = screen.getByText('Damage 12').closest('[data-variant]')!;
    expect(outcome).toHaveAttribute('data-variant', 'outcome');
    expect(outcome.className).toMatch(/MuiChip-filled/);
    expect(screen.getByText('Bleeding 2').closest('[data-variant]')).toHaveAttribute('data-variant', 'effect');
  });

  it('is not a button', () => {
    renderWithProviders(<RmuChip variant="outcome" label="Fumble" hint="Effects on the attacker" />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByLabelText('Effects on the attacker')).toBeInTheDocument();
  });
});
