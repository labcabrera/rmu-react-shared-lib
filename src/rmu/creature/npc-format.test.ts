import { describe, expect, it } from 'vitest';
import { Npc } from '../../api/npc.dto';
import { environmentFactionName, npcImage, npcName } from './npc-format';

const t = (key: string, options?: Record<string, unknown>) => (options?.defaultValue as string) ?? `t:${key}`;

describe('npc format (spec 055)', () => {
  it('names a book creature by its key and the others by their name', () => {
    expect(npcName({ name: 'Wolf', source: { key: 'wolf' } as Npc['source'] }, (key) => `t:${key}`)).toBe(
      't:creature-wolf'
    );
    expect(npcName({ name: 'My guard', source: null }, t)).toBe('My guard');
  });

  it('takes the image of the NPC or of its creature group', () => {
    expect(npcImage({ name: 'x', group: null, source: null, imageUrl: 'images/own.png' })).toBe('images/own.png');
    expect(npcImage({ name: 'x', group: 'bears', source: null, imageUrl: null })).toBe('images/npcs/bear.png');
    expect(npcImage({ name: 'x', group: null, source: null, imageUrl: null })).toBe('images/npcs/unknown.png');
  });

  it('translates the default name of the environment only', () => {
    expect(environmentFactionName('Environment', t)).toBe('t:environment-faction');
    expect(environmentFactionName(undefined, t)).toBe('t:environment-faction');
    expect(environmentFactionName('Dark forest', t)).toBe('Dark forest');
  });
});
