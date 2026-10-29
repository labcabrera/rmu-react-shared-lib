import React from 'react';
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CharacterSkill } from '../../api/character.dto';
import { renderWithProviders } from '../../test/render';
import SkillGroupList, { sortSkillsByName } from './SkillGroupList';

// The API sorts by id (English); in Spanish the names sort differently
const es: Record<string, string> = {
  athletics: 'Atletismo',
  climbing: 'Trepar',
  'region-lore': 'Saber regional',
  survival: 'Supervivencia',
  Gondor: 'Gondor',
  Anorien: 'Anórien',
};
const t = (key: string) => es[key] ?? key;

describe('sortSkillsByName', () => {
  const skills = [
    { skillId: 'athletics' },
    { skillId: 'climbing' },
    { skillId: 'region-lore', specialization: 'Gondor' },
    { skillId: 'survival', specialization: 'Gondor' },
    { skillId: 'survival', specialization: 'Anorien' },
  ];

  it('sorts by the translated name, then by the translated specialization, ignoring accents', () => {
    expect(sortSkillsByName(skills, t, 'es').map((s) => `${s.skillId}:${s.specialization ?? ''}`)).toEqual([
      'athletics:',
      'region-lore:Gondor',
      'survival:Anorien',
      'survival:Gondor',
      'climbing:',
    ]);
  });

  it('keeps the input as it is', () => {
    const copy = [...skills];
    sortSkillsByName(skills, t, 'es');
    expect(skills).toEqual(copy);
  });
});

describe('SkillGroupList', () => {
  const skill = (overrides: Partial<CharacterSkill>): CharacterSkill =>
    ({ statistics: [], ranks: 1, totalBonus: 10, development: [], ...overrides }) as CharacterSkill;

  it('groups by the categoryId strategic sends and marks professional skills and knacks with icons', () => {
    renderWithProviders(
      <SkillGroupList
        searchable={false}
        skills={[
          skill({ id: '1', skillId: 'running', categoryId: 'movement', professional: ['professional', 'knack'] }),
          skill({ id: '2', skillId: 'perception', categoryId: 'awareness' }),
          skill({ id: '3', skillId: 'battle-styles', categoryId: 'battle-expertise', specialization: 'berserker' }),
        ]}
      />
    );
    expect(screen.queryByText('other')).toBeNull();
    expect(screen.getByText('movement')).toBeInTheDocument();
    expect(screen.getByText('awareness')).toBeInTheDocument();
    // The specialization goes through the translation too
    expect(screen.getByText('battle-styles (berserker)')).toBeInTheDocument();
    const running = screen.getByText('running').parentElement!;
    expect(within(running).getByLabelText('professional-skill')).toBeInTheDocument();
    expect(within(running).getByLabelText('knack-skill')).toBeInTheDocument();
  });
});
