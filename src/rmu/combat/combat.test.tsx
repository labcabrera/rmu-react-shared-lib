import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ConfirmedRollInput from '../../inputs/ConfirmedRollInput';
import OpenEndedRollInput from '../../inputs/OpenEndedRollInput';
import SidePanelLayout from '../../layouts/SidePanelLayout';
import { renderWithProviders } from '../../test/render';
import FlowSteps from '../../ui/FlowSteps';
import ActionStateMarker from './ActionStateMarker';
import ActionTypeChip from './ActionTypeChip';
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

describe('roll inputs with dice', () => {
  it('fills an open-ended roll, asking for more dice when it explodes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const random = vi.spyOn(Math, 'random');
    renderWithProviders(<OpenEndedRollInput onChange={onChange} />);
    random.mockReturnValueOnce(0.97); // 98: open-ended, needs another roll
    await user.click(screen.getByRole('button', { name: 'roll-dice' }));
    expect(onChange).not.toHaveBeenCalled();
    random.mockReturnValueOnce(0.04); // 5
    await user.click(screen.getByRole('button', { name: 'roll-dice' }));
    expect(onChange).toHaveBeenCalledWith(103, { unmodified: 98, rolls: [98, 5] });
  });

  it('confirms a random roll in range', async () => {
    const onConfirm = vi.fn();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    renderWithProviders(<ConfirmedRollInput label="critical" value={null} onConfirm={onConfirm} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'roll-dice' }));
    expect(onConfirm).toHaveBeenCalledWith(51);
  });
});
