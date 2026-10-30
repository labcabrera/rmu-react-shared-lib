import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AttackTablePicker, EnumPicker, ItemCategoryPicker, ProfessionPicker, RarityPicker, SkillPicker } from '.';
import { Skill } from '../../api/skill.dto';
import { renderWithProviders } from '../../test/render';

// Without an i18n instance, t() returns the key (or the defaultValue).

describe('picker presets', () => {
  it('shows the four rarities as tiles with "all"', async () => {
    const onChange = vi.fn();
    renderWithProviders(<RarityPicker value={null} allowAll onChange={onChange} />);
    const group = screen.getByRole('radiogroup', { name: 'rarity' });
    expect(within(group).getAllByRole('radio')).toHaveLength(5);
    await userEvent.click(screen.getByRole('radio', { name: 'rare' }));
    expect(onChange).toHaveBeenCalledWith('rare', 'rare');
  });

  it('shows the item categories in a select (item-category-* label, the key without i18n)', async () => {
    renderWithProviders(<ItemCategoryPicker value="armor" onChange={vi.fn()} />);
    expect(screen.getByRole('combobox', { name: 'category' })).toHaveValue('armor');
    renderWithProviders(<ItemCategoryPicker categories={['weapon', 'mount']} value="mount" onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'mount' })).toHaveAttribute('aria-checked', 'true');
  });

  it('takes professions as ids, skills grouped by category and tables as props', async () => {
    const onChange = vi.fn();
    renderWithProviders(<ProfessionPicker professions={['fighter', 'thief']} value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'thief' }));
    expect(onChange).toHaveBeenCalledWith('thief', undefined);

    const skills = Array.from({ length: 10 }, (_, index) => ({
      id: `skill-${index}`,
      categoryId: index < 5 ? 'combat' : 'lore',
    })) as Skill[];
    renderWithProviders(<SkillPicker skills={skills} value={null} onChange={vi.fn()} />);
    await userEvent.click(screen.getByRole('combobox', { name: 'skill' }));
    const listbox = await screen.findByRole('listbox');
    expect(within(listbox).getByText('combat')).toBeInTheDocument();
    expect(within(listbox).getByText('lore')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    renderWithProviders(<AttackTablePicker tables={['dagger', 'mace']} value="mace" onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup', { name: 'attack-table' })).toBeInTheDocument();
  });

  it('labels the values of an enum with a prefix', () => {
    renderWithProviders(
      <EnumPicker label="Status" values={['open', 'closed']} labelPrefix="status-" value="open" onChange={vi.fn()} />
    );
    expect(screen.getByRole('radio', { name: 'status-open' })).toHaveAttribute('aria-checked', 'true');
  });

  it('describes each value under its option and the chosen one as helper text (spec 052)', async () => {
    renderWithProviders(
      <EnumPicker
        label="Policy"
        variant="select"
        values={['free', 'locked']}
        labelPrefix="policy-"
        formatDescription={(value) => `policy-help-${value}`}
        value="free"
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('policy-help-free')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('combobox', { name: 'Policy' }));
    expect(await screen.findByText('policy-help-locked')).toBeInTheDocument();
  });
});
