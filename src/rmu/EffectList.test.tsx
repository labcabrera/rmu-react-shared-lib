import React from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { fireEvent, screen } from '@testing-library/react';
import i18next from 'i18next';
import { describe, expect, it, vi } from 'vitest';
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
    expect(bleeding).toHaveAttribute('data-tone', 'error');
    expect(fatigue).toHaveAttribute('data-tone', 'warning');
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
    chips.forEach((chip) => expect(chip.closest('.MuiChip-root')).toHaveAttribute('data-tone', 'error'));
  });
});

describe('EffectList grapple and concentration (spec 077)', () => {
  const withTexts = async () => {
    const i18n = i18next.createInstance();
    await i18n.use(initReactI18next).init({
      lng: 'en',
      resources: {
        en: {
          translation: {
            grappled: 'Grappled',
            concentrating: 'Concentrating',
            'effect-grappled-by': 'By {{name}}',
            'effect-grappled-object': 'By an object',
            'effect-grappled-tightened': 'Tightened',
            'concentration-kind-spell-preparation': 'Preparing a spell',
          },
        },
      },
    });
    return i18n;
  };

  it('shows a grapple as a percent and names its grappler in the tooltip', async () => {
    const i18n = await withTexts();
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <EffectList
          effects={[{ status: 'grappled', value: 30, targetActorId: 'a2', data: { tightened: true } }]}
          actorName={(id) => (id === 'a2' ? 'Orc' : undefined)}
        />
      </I18nextProvider>
    );

    const chip = screen.getByText('Grappled 30 %').closest('.MuiChip-root')!;
    expect(chip).toHaveAttribute('aria-label', 'By Orc · Tightened');
  });

  it('keeps working without a name resolver and tells an object apart', async () => {
    const i18n = await withTexts();
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <EffectList
          effects={[
            { status: 'grappled', value: 20, targetActorId: 'a2' },
            { status: 'grappled', value: 10, data: { object: true } },
          ]}
        />
      </I18nextProvider>
    );

    expect(screen.getByText('Grappled 20 %').closest('.MuiChip-root')).not.toHaveAttribute('aria-label');
    expect(screen.getByText('Grappled 10 %').closest('.MuiChip-root')).toHaveAttribute('aria-label', 'By an object');
  });

  it('shows concentration amber with an icon and its kind and note', async () => {
    const i18n = await withTexts();
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <EffectList effects={[{ status: 'concentrating', data: { kind: 'spell-preparation', note: 'Fire Bolt' } }]} />
      </I18nextProvider>
    );

    const chip = screen.getByText('Concentrating').closest('.MuiChip-root')!;
    expect(chip).toHaveAttribute('data-tone', 'warning');
    expect(chip).toHaveAttribute('aria-label', 'Preparing a spell · Fire Bolt');
    expect(chip.querySelector('svg')).not.toBeNull();
  });

  it('shows the grapple percent in the compact variant', async () => {
    const i18n = await withTexts();
    renderWithProviders(
      <I18nextProvider i18n={i18n}>
        <EffectList variant="compact" effects={[{ status: 'grappled', value: 30 }]} />
      </I18nextProvider>
    );

    expect(screen.getByRole('button', { name: /^Grappled 30 %/ })).toBeInTheDocument();
  });

  it('deletes the stored effects by hand, not the derived ones nor in the compact badges', () => {
    const onDelete = vi.fn();
    const effects = [
      { id: 'e-1', status: 'stunned', value: -25 },
      { status: 'bleeding', value: 4 },
    ];
    const { unmount } = renderWithProviders(<EffectList effects={effects} onDelete={onDelete} />);

    const buttons = screen.getAllByLabelText(/^delete-effect/);
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(onDelete).toHaveBeenCalledWith(effects[0]);
    unmount();

    renderWithProviders(<EffectList effects={effects} onDelete={onDelete} variant="compact" />);
    expect(screen.queryAllByLabelText(/^delete-effect/)).toHaveLength(0);
  });
});
