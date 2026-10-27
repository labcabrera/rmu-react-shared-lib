import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  bleedingCut,
  healedSkin,
  permanentOrgan,
  poisonedNerve,
  recoveringBone,
  sampleInjuries,
} from '../../test/fixtures/injury';
import { renderWithProviders } from '../../test/render';
import HealerPicker, { HealerCandidate, HealerSelection, resolveHealer } from './HealerPicker';
import HpBreakdown, { formatHpAmount } from './HpBreakdown';
import InjuryCard, { recoveryProgress } from './InjuryCard';
import InjuryList, { sortInjuries } from './InjuryList';
import InjurySourceLine from './InjurySourceLine';
import InjuryTypeChip from './InjuryTypeChip';
import PoisonDataFields, { isPoisonDataValid } from './PoisonDataFields';
import PoisonStageTimeline, { poisonStageState, poisonTimeLabel } from './PoisonStageTimeline';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('InjuryTypeChip', () => {
  it('labels the chip with the type key', () => {
    renderWithProviders(<InjuryTypeChip type="muscle-tendon" />);
    expect(screen.getByText('injury-type-muscle-tendon')).toBeInTheDocument();
  });
});

describe('InjurySourceLine', () => {
  it('shows the kind, critical key, attacker, round and game', () => {
    renderWithProviders(<InjurySourceLine source={bleedingCut.source} />);
    expect(
      screen.getByText(
        'injury-source-critical S-C-91 · attacker: Orc captain · round 3 · tactical-game: Ambush at the ford'
      )
    ).toBeInTheDocument();
  });

  it('renders the game through the link renderer', () => {
    renderWithProviders(
      <InjurySourceLine
        source={bleedingCut.source}
        renderGameLink={(id, label) => <a href={`/tactical/${id}`}>{label}</a>}
      />
    );
    expect(screen.getByRole('link', { name: 'tactical-game: Ambush at the ford' })).toHaveAttribute(
      'href',
      '/tactical/game-1'
    );
  });

  it('shows only the kind of a manual injury', () => {
    renderWithProviders(<InjurySourceLine source={{ kind: 'manual' }} />);
    expect(screen.getByText('injury-source-manual')).toBeInTheDocument();
  });
});

describe('InjuryCard', () => {
  it('shows type, severity, location, penalty, bleeding, flags and origin', () => {
    renderWithProviders(<InjuryCard injury={bleedingCut} />);
    expect(screen.getByText('injury-type-cut-burn')).toBeInTheDocument();
    expect(screen.getByText('injury-severity-medium')).toBeInTheDocument();
    expect(screen.getByText('arm · side-left')).toBeInTheDocument();
    expect(screen.getByText('-25')).toBeInTheDocument();
    expect(screen.getByText('injury-bleeding-per-round').closest('.MuiChip-root')).toHaveClass('MuiChip-colorError');
    expect(screen.getByText('injury-flag-permanent-risk')).toBeInTheDocument();
    expect(screen.getByText('Deep cut on the forearm')).toBeInTheDocument();
    expect(screen.getByText(/injury-source-critical S-C-91/)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows the recovery progress, the initial penalty and the bleeding control', () => {
    renderWithProviders(<InjuryCard injury={recoveringBone} />);
    expect(screen.getByText('injury-status-recovering')).toBeInTheDocument();
    expect(screen.getByText('injury-initial-penalty-value')).toBeInTheDocument();
    expect(screen.getByText('bleeding-control-stitches')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '75');
    expect(recoveryProgress(recoveringBone)).toBe(75);
    expect(recoveryProgress(bleedingCut)).toBeUndefined();
  });

  it('marks permanent injuries and leaves out the description and origin when dense', () => {
    renderWithProviders(<InjuryCard injury={{ ...permanentOrgan, description: 'Scar' }} dense />);
    expect(screen.getByText('injury-status-permanent')).toBeInTheDocument();
    expect(screen.getByText('permanent-penalty-value')).toBeInTheDocument();
    expect(screen.queryByText('Scar')).not.toBeInTheDocument();
    expect(screen.queryByText('injury-source-manual')).not.toBeInTheDocument();
  });

  it('renders the actions and calls onEdit with the injury', async () => {
    const onEdit = vi.fn();
    renderWithProviders(<InjuryCard injury={bleedingCut} onEdit={onEdit} actions={<button>treat</button>} />);
    expect(screen.getByRole('button', { name: 'treat' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'edit' }));
    expect(onEdit).toHaveBeenCalledWith(bleedingCut);
  });
});

describe('PoisonStageTimeline', () => {
  const t = (key: string, options?: Record<string, unknown>) => `${key}:${options?.count}`;

  it('gives a time in its largest unit, rounded', () => {
    expect(poisonTimeLabel(4, t)).toBe('poison-time-rounds:4');
    expect(poisonTimeLabel(12, t)).toBe('poison-time-minutes:2');
    expect(poisonTimeLabel(720, t)).toBe('poison-time-hours:2');
    expect(poisonTimeLabel(8640, t)).toBe('poison-time-days:1');
    expect(poisonTimeLabel(2917, t)).toBe('poison-time-hours:8');
    expect(poisonTimeLabel(37, t)).toBe('poison-time-minutes:6');
  });

  it('shows the poison, each stage with its state and the antidotes', () => {
    renderWithProviders(<PoisonStageTimeline poison={poisonedNerve.poison!} />);
    expect(screen.getByText('Test venom')).toBeInTheDocument();
    expect(screen.getByTestId('poison-stage-mild')).toHaveAttribute('data-state', 'ended');
    expect(screen.getByTestId('poison-stage-moderate')).toHaveAttribute('data-state', 'active');
    expect(screen.getByTestId('poison-stage-severe')).toHaveAttribute('data-state', 'pending');
    expect(screen.getByText('poison-rr-summary')).toBeInTheDocument();
    expect(screen.getByText('poison-antidotes')).toBeInTheDocument();
    expect(poisonStageState(poisonedNerve.poison!.stages[1])).toBe('active');
  });

  it('ends every stage of a neutralized poisoning', () => {
    renderWithProviders(
      <PoisonStageTimeline poison={{ ...poisonedNerve.poison!, neutralized: true, finished: true }} />
    );
    expect(screen.getByText('poison-neutralized')).toBeInTheDocument();
    expect(screen.getByTestId('poison-stage-severe')).toHaveAttribute('data-state', 'ended');
  });

  it('is in the injury card, which then leaves out a description equal to the poison name', () => {
    renderWithProviders(<InjuryCard injury={poisonedNerve} />);
    expect(screen.getAllByText('Test venom')).toHaveLength(1);
    expect(screen.getByTestId('poison-stage-moderate')).toBeInTheDocument();
  });
});

describe('PoisonDataFields', () => {
  const catalog = [
    {
      id: 'test-venom',
      name: 'Test venom',
      features: {
        poison: {
          category: 'nerve' as const,
          level: 3,
          form: 'paste' as const,
          maxSeverity: null,
          immediateHits: null,
          onsetRounds: null,
        },
      },
    },
    { id: 'rope', name: 'Rope', features: null },
  ];

  it('picks a catalog poison and copies its block', async () => {
    const onChange = vi.fn();
    renderWithProviders(<PoisonDataFields catalog={catalog} value={undefined} onChange={onChange} />);
    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.queryByText('Rope')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Test venom'));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ itemTypeId: 'test-venom', category: 'nerve', level: 3 })
    );
  });

  it('describes a poison by hand', async () => {
    const Harness = () => {
      const [value, setValue] = useState<Parameters<typeof isPoisonDataValid>[0]>();
      return (
        <>
          <PoisonDataFields catalog={catalog} value={value} onChange={setValue} />
          <span>{isPoisonDataValid(value) ? 'valid' : 'invalid'}</span>
        </>
      );
    };
    renderWithProviders(<Harness />);
    await userEvent.click(screen.getByRole('switch', { name: 'poison-manual' }));
    expect(screen.getByText('invalid')).toBeInTheDocument();
    await userEvent.type(screen.getByRole('textbox', { name: 'name' }), 'Swamp venom');
    expect(screen.getByText('valid')).toBeInTheDocument();
  });
});

describe('InjuryList', () => {
  it('sorts by status and severity', () => {
    expect(sortInjuries(sampleInjuries).map((injury) => injury.id)).toEqual([
      bleedingCut.id,
      recoveringBone.id,
      permanentOrgan.id,
      healedSkin.id,
    ]);
  });

  it('hides healed injuries unless asked and renders actions per injury', () => {
    const { rerender } = renderWithProviders(
      <InjuryList injuries={sampleInjuries} renderActions={(injury) => <button>{`treat ${injury.id}`}</button>} />
    );
    expect(screen.getAllByRole('button', { name: /^treat/ })).toHaveLength(3);
    expect(screen.queryByText('injury-type-skin-tissue')).not.toBeInTheDocument();
    rerender(<InjuryList injuries={sampleInjuries} showHealed />);
    expect(screen.getByText('injury-type-skin-tissue')).toBeInTheDocument();
    expect(screen.getByText('injury-status-healed')).toBeInTheDocument();
  });

  it('shows the empty text', () => {
    const { rerender } = renderWithProviders(<InjuryList injuries={[healedSkin]} />);
    expect(screen.getByText('no-injuries')).toBeInTheDocument();
    rerender(<InjuryList injuries={[]} emptyText="Healthy" />);
    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });
});

describe('HealerPicker', () => {
  const characters: HealerCandidate[] = [
    { id: 'me', name: 'Aragorn', medicine: 40, herbalism: 25 },
    { id: 'friend', name: 'Elrond', medicine: 90 },
  ];

  const Harness = ({ initial, onValue }: { initial: HealerSelection; onValue: (v: HealerSelection) => void }) => {
    const [value, setValue] = useState<HealerSelection>(initial);
    return (
      <HealerPicker
        characters={characters}
        selfId="me"
        value={value}
        onChange={(next) => {
          setValue(next);
          onValue(next);
        }}
      />
    );
  };

  it('resolves the healer of each mode', () => {
    expect(resolveHealer({ mode: 'self' }, characters, 'me')).toEqual({
      characterId: 'me',
      name: 'Aragorn',
      medicine: 40,
      herbalism: 25,
      external: false,
    });
    expect(resolveHealer({ mode: 'character', characterId: 'friend' }, characters)?.medicine).toBe(90);
    expect(resolveHealer({ mode: 'character' }, characters)).toBeUndefined();
    expect(resolveHealer({ mode: 'external', name: ' ', medicine: 10 }, characters)).toBeUndefined();
    expect(resolveHealer({ mode: 'external', name: 'Ioreth', medicine: 30 }, characters)).toEqual({
      name: 'Ioreth',
      medicine: 30,
      herbalism: undefined,
      external: true,
    });
  });

  it('shows the character itself with its bonuses', () => {
    renderWithProviders(<Harness initial={{ mode: 'self' }} onValue={vi.fn()} />);
    expect(screen.getByDisplayValue('Aragorn (medicine +40 · herbalism +25)')).toBeInTheDocument();
  });

  it('switches to another character, defaulting to the first one that is not the character itself', async () => {
    const onValue = vi.fn();
    renderWithProviders(<Harness initial={{ mode: 'self' }} onValue={onValue} />);
    await userEvent.click(screen.getByRole('button', { name: 'character' }));
    expect(onValue).toHaveBeenLastCalledWith({ mode: 'character', characterId: 'friend' });
    expect(screen.getByText('Elrond')).toBeInTheDocument();
    expect(screen.getByText('medicine +90')).toBeInTheDocument();
  });

  it('takes an external healer typed by hand', async () => {
    const onValue = vi.fn();
    renderWithProviders(<Harness initial={{ mode: 'self' }} onValue={onValue} />);
    await userEvent.click(screen.getByRole('button', { name: 'healer-external' }));
    await userEvent.type(screen.getByLabelText('name'), 'Ioreth');
    const medicine = screen.getByLabelText('healer-medicine-bonus');
    fireEvent.change(medicine, { target: { value: '35' } });
    fireEvent.blur(medicine);
    expect(onValue).toHaveBeenLastCalledWith({ mode: 'external', name: 'Ioreth', medicine: 35 });
  });
});

describe('HpBreakdown', () => {
  it('shows the totals by kind in a fixed order and by attacker, with their sign', () => {
    renderWithProviders(
      <HpBreakdown
        bySource={{
          byKind: { treatment: 4, attack: -18, manual: 0 },
          byAttacker: [{ attackerId: 'orc-1', attackerName: 'Orc captain', amount: -18 }],
        }}
      />
    );
    const labels = screen.getAllByText(/^hp-log-kind-/).map((node) => node.textContent);
    expect(labels).toEqual(['hp-log-kind-attack', 'hp-log-kind-treatment']);
    expect(screen.getByText('Orc captain')).toBeInTheDocument();
    expect(screen.getAllByText('-18')).toHaveLength(2);
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  it('renders nothing without totals', () => {
    const { container } = renderWithProviders(<HpBreakdown bySource={{ byKind: {}, byAttacker: [] }} />);
    expect(container).toBeEmptyDOMElement();
    expect(formatHpAmount(0)).toBe('0');
  });
});
