import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SidePanelLayout from '../../layouts/SidePanelLayout';
import { renderWithProviders } from '../../test/render';
import FlowSteps from '../../ui/FlowSteps';
import ActionStateMarker from './ActionStateMarker';
import ActionTypeChip from './ActionTypeChip';
import ApPips, { apPhasePips } from './ApPips';
import { combatActionInfo, combatColors, factionColor } from './actionTypes';

// Without an i18n instance, t() returns the key: labels below are translation keys.

const mockWidth = (matches: boolean) =>
  vi.stubGlobal(
    'matchMedia',
    (query: string) =>
      ({
        matches,
        media: query,
        onchange: null,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        addListener: () => undefined,
        removeListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList
  );

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('action types', () => {
  it('maps types to categories and falls back to other', () => {
    expect(combatActionInfo('melee_attack').category).toBe('melee');
    expect(combatActionInfo('cast_instant').labelKey).toBe('instant-spell');
    expect(combatActionInfo('unknown').category).toBe('other');
  });

  it('renders a chip with the type name or a custom label', () => {
    renderWithProviders(
      <>
        <ActionTypeChip type="ranged_attack" />
        <ActionTypeChip type="melee_attack" label="Melee → Orc 2" />
      </>
    );
    expect(screen.getByText('ranged_attack')).toBeInTheDocument();
    expect(screen.getByText('Melee → Orc 2')).toBeInTheDocument();
  });

  // A remote can run inside an older shell whose theme has no combat colors.
  it('falls back to the default combat colors when the theme has none', () => {
    const theme = createTheme();
    expect(combatColors(theme).melee).toMatch(/^#/);
    render(
      <ThemeProvider theme={theme}>
        <ActionTypeChip type="melee_attack" />
        <ActionStateMarker state="resolved" />
      </ThemeProvider>
    );
    expect(screen.getByText('melee_attack')).toBeInTheDocument();
  });

  it('gives each faction a color by position, cycling, and a neutral one to unknown factions', () => {
    const theme = createTheme();
    expect(factionColor(theme, 0)).not.toBe(factionColor(theme, 1));
    expect(factionColor(theme, 7)).toBe(factionColor(theme, 0));
    expect(factionColor(theme, -1)).toBe(factionColor(theme, -1));
    expect(factionColor(theme, -1)).not.toBe(factionColor(theme, 0));
  });

  it('names the state of an action, with its result', () => {
    renderWithProviders(<ActionStateMarker state="resolved" text="+42" />);
    expect(screen.getByRole('img', { name: 'action-state-resolved: +42' })).toBeInTheDocument();
  });

  it('names the readiness states of an action', () => {
    renderWithProviders(
      <>
        <ActionStateMarker state="blocked" />
        <ActionStateMarker state="unreachable" />
        <ActionStateMarker state="optimal" text="4/4" />
        <ActionStateMarker state="held" />
      </>
    );
    expect(screen.getByRole('img', { name: 'action-readiness-blocked' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'action-readiness-unreachable' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'action-readiness-optimal: 4/4' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'action-readiness-held' })).toBeInTheDocument();
  });

  // An older shell builds a theme whose combat colors have no `optimal`.
  it('fills in the combat colors missing from the theme', () => {
    const theme = createTheme({ palette: { combat: { melee: '#ff0000' } } as never });
    expect(combatColors(theme).melee).toBe('#ff0000');
    expect(combatColors(theme).optimal).toMatch(/^#/);
  });
});

describe('action points', () => {
  it('spends the base point first and shows capacity over 1 as bonus points', () => {
    const pips = apPhasePips(
      [1, 1, 2, 2],
      [
        { phase: 1, ap: 1, kind: 'spent' },
        { phase: 3, ap: 1, kind: 'spent' },
      ]
    );
    expect(pips[0]).toEqual([{ state: 'spent', bonus: false }]);
    expect(pips[1]).toEqual([{ state: 'available', bonus: false }]);
    expect(pips[2]).toEqual([
      { state: 'spent', bonus: false },
      { state: 'available', bonus: true },
    ]);
  });

  it('shows phases without capacity and lost ledger points as lost', () => {
    const pips = apPhasePips([0, 0, 1, 1], [{ phase: 4, ap: 1, kind: 'lost' }]);
    expect(pips[0]).toEqual([{ state: 'lost', bonus: false }]);
    expect(pips[3]).toEqual([
      { state: 'available', bonus: false },
      { state: 'lost', bonus: false },
    ]);
    // A lost point where the capacity is already missing is not counted twice.
    expect(apPhasePips([1, 0, 1, 1], [{ phase: 2, ap: 1, kind: 'lost' }])[1]).toHaveLength(1);
  });

  it('names the points of each phase', () => {
    renderWithProviders(<ApPips capacity={[1, 1, 1, 2]} ledger={[{ phase: 1, ap: 1, kind: 'spent' }]} />);
    expect(screen.getAllByRole('img')).toHaveLength(4);
    expect(screen.getAllByRole('img', { name: 'ap-pips-phase' })).toHaveLength(4);
  });
});

describe('FlowSteps', () => {
  const steps = [
    { id: 'targets', label: 'Targets', summary: 'Orc 2', content: <span>pick target</span> },
    { id: 'modifiers', label: 'Modifiers', content: <span>modifiers form</span> },
    { id: 'roll', label: 'Roll', content: <span>roll form</span> },
  ];

  it('collapses done steps, opens the current one and greys the next', () => {
    renderWithProviders(<FlowSteps steps={steps} activeIndex={1} footer={<button>Prepare</button>} />);
    expect(screen.getByText('Orc 2')).toBeInTheDocument();
    expect(screen.queryByText('pick target')).not.toBeInTheDocument();
    expect(screen.getByText('modifiers form')).toBeInTheDocument();
    expect(screen.queryByText('roll form')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Prepare' })).toBeInTheDocument();
  });

  it('opens a done step read-only for review', async () => {
    const onReview = vi.fn();
    const { rerender } = renderWithProviders(<FlowSteps steps={steps} activeIndex={1} onReview={onReview} />);
    await userEvent.setup().click(screen.getByText('Targets'));
    expect(onReview).toHaveBeenCalledWith('targets');
    rerender(<FlowSteps steps={steps} activeIndex={1} onReview={onReview} reviewing="targets" />);
    expect(screen.getByText('pick target').closest('[inert]')).not.toBeNull();
  });
});

describe('SidePanelLayout', () => {
  it('docks the panel on wide screens and closes it with Esc', () => {
    mockWidth(true);
    const onClose = vi.fn();
    renderWithProviders(
      <SidePanelLayout open onClose={onClose} title="Melee attack" panel={<span>flow</span>}>
        <span>board</span>
      </SidePanelLayout>
    );
    expect(screen.getByText('board')).toBeInTheDocument();
    const aside = screen.getByText('flow').closest('aside')!;
    fireEvent.keyDown(aside, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a full-screen sheet with a back arrow on phones', async () => {
    mockWidth(false);
    const onClose = vi.fn();
    renderWithProviders(
      <SidePanelLayout open onClose={onClose} title="Melee attack" panel={<span>flow</span>}>
        <span>board</span>
      </SidePanelLayout>
    );
    await userEvent.setup().click(screen.getByRole('button', { name: 'back' }));
    expect(onClose).toHaveBeenCalled();
  });
});
