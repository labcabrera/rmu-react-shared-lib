import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import SkillSelector from './SkillSelector';

// Stable like the context value: the selector refetches the specializations when it changes
const auth = {};
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
vi.mock('../api/skill-category.api', () => ({
  fetchSkillCategories: vi.fn(async () => ({ content: [{ id: 'athletic' }, { id: 'outdoor' }, { id: 'lore' }] })),
}));
vi.mock('../api/skill.api', () => ({
  fetchSkills: vi.fn(async () => ({
    content: [
      { id: 'swimming', categoryId: 'athletic' },
      { id: 'climbing', categoryId: 'athletic' },
      { id: 'survival', categoryId: 'outdoor', specialization: 'region' },
      { id: 'tracking', categoryId: 'outdoor' },
      { id: 'region-lore', categoryId: 'lore', specialization: 'region' },
    ],
  })),
}));
const fetchEnumerations = vi.fn();
vi.mock('../api/enumerations.api', () => ({ fetchEnumerations: (...args: unknown[]) => fetchEnumerations(...args) }));
vi.mock('../api/spell-list.api', () => ({ fetchSpellLists: vi.fn() }));

const skillButtons = () =>
  screen
    .getAllByRole('button')
    .filter((button) => button.hasAttribute('aria-pressed'))
    .map((button) => button.textContent);

describe('SkillSelector', () => {
  beforeEach(() => {
    fetchEnumerations.mockReset();
    fetchEnumerations.mockResolvedValue({ content: [{ key: 'Gondor' }, { key: 'Ithilien' }, { key: 'Mordor' }] });
  });

  const renderSelector = (props: Partial<React.ComponentProps<typeof SkillSelector>> = {}) => {
    const onSkillChange = vi.fn();
    const onSpecializationChange = vi.fn();
    renderWithProviders(
      <SkillSelector
        realmId="middle-earth"
        onSkillChange={onSkillChange}
        onSpecializationChange={onSpecializationChange}
        onError={vi.fn()}
        {...props}
      />
    );
    return { onSkillChange, onSpecializationChange };
  };

  it('finds skills of every category, hides the categories without results and takes the first with Enter', async () => {
    const { onSkillChange } = renderSelector();
    const search = await screen.findByRole('textbox', { name: 'search-skill' });
    await userEvent.type(search, 'SURV');
    expect(screen.queryByRole('button', { name: /athletic/ })).toBeNull();
    expect(screen.getByRole('button', { name: /^outdoor/ })).toBeInTheDocument();
    expect(skillButtons()).toContain('survivaloutdoor');
    await userEvent.type(search, '{Enter}');
    expect(onSkillChange).toHaveBeenLastCalledWith('survival');
    expect(fetchEnumerations).toHaveBeenCalledWith(
      'category==region;(realmId==middle-earth,realmId==null)',
      0,
      200,
      expect.anything()
    );
    expect(await screen.findByRole('button', { name: 'Ithilien' })).toBeInTheDocument();
  });

  it('ranks the names that start with the text first and narrows the results by category', async () => {
    renderSelector();
    const search = await screen.findByRole('textbox', { name: 'search-skill' });
    await userEvent.type(search, 'r');
    // Names starting with the text first (region-lore), then those containing it, by name
    const results = skillButtons().filter((text) => /(athletic|outdoor|lore)$/.test(text ?? '') && text !== 'lore');
    expect(results).toEqual(['region-lorelore', 'survivaloutdoor', 'trackingoutdoor']);
    await userEvent.click(screen.getByRole('button', { name: /^outdoor/ }));
    expect(skillButtons()).toEqual(expect.arrayContaining(['survival', 'tracking']));
    expect(skillButtons()).not.toContain('region-lore');
  });

  it('marks the owned skills: one without specialization is disabled, an owned specialization too', async () => {
    renderSelector({
      owned: [
        { skillId: 'swimming', ranks: 3 },
        { skillId: 'survival', specialization: 'Gondor', ranks: 2 },
      ],
    });
    await userEvent.type(await screen.findByRole('textbox', { name: 'search-skill' }), 's');
    expect(screen.getByRole('button', { name: /^swimming/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /^survival/ }));
    expect(await screen.findByRole('button', { name: /^Gondor/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Mordor' })).toBeEnabled();
  });

  it('filters a long specialization list', async () => {
    fetchEnumerations.mockResolvedValue({
      content: Array.from({ length: 12 }, (_, index) => ({ key: `region-${index}` })).concat([{ key: 'Ithilien' }]),
    });
    renderSelector();
    await userEvent.type(await screen.findByRole('textbox', { name: 'search-skill' }), 'survival{Enter}');
    const filter = await screen.findByRole('textbox', { name: 'search-specialization' });
    await userEvent.type(filter, 'ithil');
    expect(screen.getByRole('button', { name: 'Ithilien' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'region-1' })).toBeNull();
  });
});
