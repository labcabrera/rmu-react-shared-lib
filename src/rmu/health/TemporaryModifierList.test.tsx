import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { temporaryModifierDaysLeft } from '../../api/temporary-modifier.dto';
import {
  fearRrBonus,
  manualPenalty,
  moraleBonus,
  sampleTemporaryModifiers,
} from '../../test/fixtures/temporary-modifier';
import { renderWithProviders } from '../../test/render';
import TemporaryModifierList, { temporaryModifierExpiry } from './TemporaryModifierList';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('temporaryModifierExpiry', () => {
  it('gives the days left from the current campaign day, or expired', () => {
    expect(temporaryModifierExpiry(moraleBonus, 10)).toEqual({
      key: 'temporary-modifier-days-left',
      params: { count: 7 },
    });
    expect(temporaryModifierExpiry(moraleBonus, 17)).toEqual({ key: 'temporary-modifier-expired' });
    expect(temporaryModifierDaysLeft(moraleBonus, 20)).toBe(-3);
  });

  it('gives the expiry day without a current day, the days of a tactical one, or until removed', () => {
    expect(temporaryModifierExpiry(moraleBonus)).toEqual({ key: 'temporary-modifier-until-day', params: { day: 17 } });
    expect(temporaryModifierExpiry(fearRrBonus, 10)).toEqual({ key: 'temporary-modifier-days', params: { count: 1 } });
    expect(temporaryModifierExpiry(manualPenalty, 10)).toEqual({ key: 'temporary-modifier-until-removed' });
    expect(temporaryModifierDaysLeft(fearRrBonus, 10)).toBeNull();
  });
});

describe('TemporaryModifierList', () => {
  it('shows kind, signed value, source and expiry of each modifier', () => {
    renderWithProviders(<TemporaryModifierList modifiers={sampleTemporaryModifiers} currentGameDay={10} />);
    expect(screen.getAllByText('temporary-modifier-kind-morale')).toHaveLength(2);
    expect(screen.getByText('temporary-modifier-kind-fear-rr')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-5')).toBeInTheDocument();
    expect(screen.getByText('temporary-rally-unusual')).toBeInTheDocument();
    expect(screen.getByText('temporary-modifier-days-left')).toBeInTheDocument();
    expect(screen.getByText('temporary-modifier-until-removed')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('removes a modifier and disables the one being removed', async () => {
    const onRemove = vi.fn();
    renderWithProviders(
      <TemporaryModifierList modifiers={[moraleBonus, manualPenalty]} onRemove={onRemove} removingId="modifier-1" />
    );
    const buttons = screen.getAllByRole('button', { name: 'delete' });
    expect(buttons[0]).toBeDisabled();
    await userEvent.click(buttons[1]);
    expect(onRemove).toHaveBeenCalledWith(manualPenalty);
  });

  it('renders nothing when empty, or a line with showEmpty', () => {
    const { container, unmount } = renderWithProviders(<TemporaryModifierList modifiers={[]} />);
    expect(container).toBeEmptyDOMElement();
    unmount();
    renderWithProviders(<TemporaryModifierList modifiers={[]} showEmpty />);
    expect(screen.getByText('temporary-modifiers-empty')).toBeInTheDocument();
  });
});
