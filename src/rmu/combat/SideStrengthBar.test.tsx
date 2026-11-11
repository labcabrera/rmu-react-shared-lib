import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import SideStrengthBar from './SideStrengthBar';
import { SideStrength } from './side-strength';

// Without an i18n instance, t() returns the key: labels below are translation keys.

const STRENGTH: SideStrength = {
  sideId: 'company',
  totalLevels: 18,
  standingLevels: 6,
  incapacitatedLevels: 10,
  fledLevels: 2,
  totalCount: 5,
  standingCount: 2,
  incapacitatedCount: 2,
  fledCount: 1,
  hpCurrent: 75,
  hpMax: 180,
};

describe('SideStrengthBar', () => {
  it('shows the standing strength, the segments, the threshold marks and the combined hit points', () => {
    const { container } = renderWithProviders(
      <SideStrengthBar label="Company" color="#3366cc" strength={STRENGTH} leaderName="Maela" />
    );
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('6 / 18 · 33%')).toBeInTheDocument();
    expect(screen.getByText('side-strength-leader')).toBeInTheDocument();
    const meter = screen.getByRole('meter', { name: 'side-strength-strength-aria' });
    expect(meter).toHaveAttribute('aria-valuenow', '6');
    expect(meter).toHaveAttribute('aria-valuemax', '18');
    const segments = [...container.querySelectorAll<HTMLElement>('[data-segment]')];
    expect(segments.map((segment) => segment.dataset.segment)).toEqual(['standing', 'incapacitated', 'fled']);
    expect(segments[0].style.width || getComputedStyle(segments[0]).width).toMatch(/^33\.3/);
    expect([...container.querySelectorAll<HTMLElement>('[data-threshold]')].map((m) => m.dataset.threshold)).toEqual([
      '0.5',
      '0.25',
      '0.1',
    ]);
    expect(screen.getByRole('progressbar', { name: 'side-strength-hp-aria' })).toBeInTheDocument();
    expect(screen.getByText('75 / 180')).toBeInTheDocument();
  });

  it('gives the breakdown by state in a tooltip', async () => {
    renderWithProviders(<SideStrengthBar label="Company" color="#3366cc" strength={STRENGTH} />);
    await userEvent.hover(screen.getByRole('meter'));
    expect(await screen.findByText('side-strength-incapacitated')).toBeInTheDocument();
    expect(screen.getByText('side-strength-standing')).toBeInTheDocument();
    expect(screen.getByText('side-strength-fled')).toBeInTheDocument();
    expect(screen.getAllByText('side-strength-levels-heads')).toHaveLength(3);
  });

  it('hides the hit points label when dense and survives an empty side', () => {
    const empty: SideStrength = {
      ...STRENGTH,
      totalLevels: 0,
      standingLevels: 0,
      incapacitatedLevels: 0,
      fledLevels: 0,
      hpCurrent: 0,
      hpMax: 0,
    };
    const { container } = renderWithProviders(<SideStrengthBar label="Empty" color="#999" strength={empty} dense />);
    expect(screen.queryByText('side-strength-hp')).toBeNull();
    expect(screen.getByText('0 / 0 · 0%')).toBeInTheDocument();
    expect(container.querySelectorAll('[data-segment]')).toHaveLength(0);
  });
});
