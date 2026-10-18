import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Character } from '../../api/character.dto';
import { EntityState } from '../../data/useEntity';
import DetailPage from '../../templates/DetailPage';
import { sampleCharacter } from '../../test/fixtures/character';
import { renderWithProviders } from '../../test/render';
import AttackCard from './AttackCard';
import SkillGroupList from './SkillGroupList';
import StatBlock from './StatBlock';
import StatPill, { formatBonus } from './StatPill';

// Without an i18n instance, t() returns the key: labels below are translation keys.

describe('formatBonus and StatPill', () => {
  it('shows the sign of bonuses', () => {
    expect([formatBonus(4), formatBonus(-3), formatBonus(0)]).toEqual(['+4', '-3', '0']);
    renderWithProviders(<StatPill label="db" value={18} signed />);
    expect(screen.getByText('+18')).toBeInTheDocument();
  });
});

describe('StatBlock', () => {
  it('renders the ten stats with their bonus', () => {
    renderWithProviders(<StatBlock statistics={sampleCharacter.statistics} />);
    expect(screen.getByText('ST')).toBeInTheDocument();
    expect(screen.getByText('+10')).toBeInTheDocument();
    expect(screen.getByText('-2')).toBeInTheDocument();
  });
});

describe('AttackCard', () => {
  it('leads with the offensive bonus and lists non-zero modifiers', () => {
    renderWithProviders(<AttackCard attack={sampleCharacter.attacks[0]} />);
    expect(screen.getByText('+96')).toBeInTheDocument();
    expect(screen.getByText('maneuver-penalty -10')).toBeInTheDocument();
  });
});

describe('SkillGroupList', () => {
  const skills = sampleCharacter.skills;

  it('groups skills by category with a count', () => {
    renderWithProviders(<SkillGroupList skills={skills} />);
    const brawn = screen.getByRole('button', { name: /brawn/ });
    expect(within(brawn).getByText('3')).toBeInTheDocument();
    expect(screen.getByText('endurance')).toBeInTheDocument();
  });

  it('filters by search and by developed skills', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SkillGroupList skills={skills} />);
    await user.click(screen.getByLabelText('only-developed'));
    expect(screen.queryByText('acrobatics')).not.toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('search-skill'), 'blade');
    expect(screen.getByText('blade (Arming sword)')).toBeInTheDocument();
    expect(screen.queryByText('endurance')).not.toBeInTheDocument();
  });

  it('collapses a group and reports the selected skill', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(<SkillGroupList skills={skills} onSelect={onSelect} />);
    await user.click(screen.getByText('endurance'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ skillId: 'endurance' }));
    await user.click(screen.getByRole('button', { name: /brawn/ }));
    expect(screen.getByRole('button', { name: /brawn/ })).toHaveAttribute('aria-expanded', 'false');
  });
});

describe('DetailPage hero', () => {
  it('shows the hero with the page actions instead of the side panel', async () => {
    const state: EntityState<Character> = {
      entity: sampleCharacter,
      setEntity: vi.fn(),
      loading: false,
      error: undefined,
      notFound: false,
      refresh: vi.fn(),
    };
    const onEdit = vi.fn();
    renderWithProviders(
      <DetailPage
        breadcrumbs={[{ name: 'characters' }]}
        entity={state}
        onEdit={onEdit}
        technicalInfo={false}
        leftPanel={() => <span>side panel</span>}
        hero={(c) => ({ title: c.name, pills: <StatPill label="db" value={c.defense.defensiveBonus} signed /> })}
      >
        {() => <span>content</span>}
      </DetailPage>
    );
    expect(screen.getByRole('heading', { name: 'Aldric Vane' })).toBeInTheDocument();
    expect(screen.queryByText('side panel')).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'edit' }));
    expect(onEdit).toHaveBeenCalled();
  });
});
