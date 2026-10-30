import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import RollBreakdown from './RollBreakdown';
import RuleHint from './RuleHint';

const hint = () =>
  renderWithProviders(
    <RuleHint
      title="Shield block -12"
      description="why"
      params={{ mode: 'partial', skill: 25, injury: -13 }}
      reference="§9.6"
    >
      <span>shield-block</span>
    </RuleHint>
  );

describe('RuleHint (spec 051)', () => {
  afterEach(() => vi.useRealTimers());

  it('pins the explanation on a click or a tap, with its inputs and reference, and closes on a second one', async () => {
    hint();
    const row = screen.getByRole('button', { name: 'shield-block' });

    await userEvent.click(row);
    const panel = await screen.findByRole('dialog');
    expect(panel).toHaveTextContent('Shield block -12');
    expect(panel).toHaveTextContent('why');
    expect(panel).toHaveTextContent('skill25');
    expect(panel).toHaveTextContent('-13');
    expect(panel).toHaveTextContent('rule-reference');
    expect(row).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('previews on a resting mouse and closes when it leaves, but never on a touch hover', () => {
    vi.useFakeTimers();
    hint();
    const row = screen.getByRole('button', { name: 'shield-block' });

    fireEvent.pointerEnter(row, { pointerType: 'touch' });
    act(() => void vi.advanceTimersByTime(1000));
    expect(row).toHaveAttribute('aria-expanded', 'false');

    fireEvent.pointerEnter(row, { pointerType: 'mouse' });
    act(() => void vi.advanceTimersByTime(1000));
    expect(row).toHaveAttribute('aria-expanded', 'true');

    fireEvent.pointerLeave(row, { pointerType: 'mouse' });
    expect(row).toHaveAttribute('aria-expanded', 'false');
  });

  it('keeps a pinned explanation when the mouse leaves', async () => {
    hint();
    const row = screen.getByRole('button', { name: 'shield-block' });

    await userEvent.click(row);
    fireEvent.pointerLeave(row, { pointerType: 'mouse' });

    expect(row).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('RollBreakdown explanations (spec 051)', () => {
  it('makes the rows with a rule open their explanation, and leaves the others plain', async () => {
    renderWithProviders(
      <RollBreakdown
        modifiers={[
          { key: 'bd', value: -30, group: 'defense', rule: '§9.6', params: { bd: 30 } },
          { key: 'custom-bonus', value: 5, group: 'situation' },
        ]}
      />
    );

    expect(screen.queryByRole('button', { name: /Custom bonus/ })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Bd/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('bd30');
  });

  it('folds the rules that did not apply, each with its reason', async () => {
    renderWithProviders(
      <RollBreakdown
        modifiers={[{ key: 'bo', value: 60, group: 'offense' }]}
        skipped={[
          {
            source: 'shield',
            group: 'defense',
            reason: 'shield-not-front',
            rule: '§9.6',
            params: { position: 'flank' },
          },
        ]}
      />
    );

    const toggle = screen.getByRole('button', { name: /rules-not-applied/ });
    expect(screen.queryByText('shield-not-front')).not.toBeInTheDocument();
    await userEvent.click(toggle);
    expect(screen.getByText('shield-not-front')).toBeInTheDocument();
    expect(screen.getByText('§9.6')).toBeInTheDocument();
  });
});
