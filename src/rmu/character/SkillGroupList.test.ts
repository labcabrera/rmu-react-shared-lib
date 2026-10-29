import { describe, expect, it } from 'vitest';
import { sortSkillsByName } from './SkillGroupList';

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
