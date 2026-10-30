import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { act, fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import i18next from 'i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import RollBreakdown from './RollBreakdown';
import RuleHint, { FieldHint } from './RuleHint';

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

describe('FieldHint (spec 052)', () => {
  it('is an information button that pins the help of a form field', async () => {
    renderWithProviders(<FieldHint title="Lethality" description="what it does" reference="§12" />);
    const button = screen.getByRole('button', { name: 'rule-help-of' });

    await userEvent.click(button);

    expect(await screen.findByRole('dialog')).toHaveTextContent('what it does');
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('RollBreakdown context (spec 052)', () => {
  it('looks up the explanations and the skip reasons of its own roll', async () => {
    const i18n = i18next.createInstance();
    await i18n.use(initReactI18next).init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            'maneuver-rule-unskilled': 'no ranks in {{skill}}',
            'combat-rule-unskilled': 'wrong context',
            'maneuver-skip-light-not-needed': 'the skill does not need light',
          },
        },
      },
    });
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <RollBreakdown
          context="maneuver"
          modifiers={[{ key: 'unskilled', value: -25, group: 'skill', params: { skill: 'climbing' } }]}
          skipped={[{ source: 'light', reason: 'light-not-needed' }]}
        />
      </I18nextProvider>
    );

    await userEvent.click(screen.getByRole('button', { name: /Unskilled/ }));
    expect(await screen.findByRole('dialog')).toHaveTextContent('no ranks in climbing');
    await userEvent.click(screen.getByRole('button', { name: /rules-not-applied/ }));
    expect(screen.getByText('the skill does not need light')).toBeInTheDocument();
  });
});
