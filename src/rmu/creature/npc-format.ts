import type { Npc } from '../../api/npc.dto';
import { DEFAULT_ENVIRONMENT_NAME } from '../../api/tactical-game.dto';

type Translate = (key: string, options?: Record<string, unknown>) => string;

/** Name of an NPC: the translated name of a book creature (`creature-<key>`), the stored name otherwise. */
export const npcName = (npc: Pick<Npc, 'name' | 'source'>, t: Translate): string =>
  npc.source?.key ? t(`creature-${npc.source.key}`, { defaultValue: npc.name }) : npc.name;

/** Images of `images/npcs/` reused by creature group or key; the rest use the generic one. */
const imageOf = (npc: Pick<Npc, 'group' | 'source' | 'name'>): string => {
  const key = npc.source?.key ?? npc.name.toLowerCase();
  if (key.includes('wolf')) return 'wolf';
  if (key.includes('warg')) return 'warg.alt';
  if (key.startsWith('lion')) return 'lion';
  if (['tiger', 'cheetah', 'smilodon'].some((each) => key.includes(each))) return 'panther';
  if (key.startsWith('horse-war')) return 'war-horse';
  switch (npc.group) {
    case 'bears':
      return 'bear';
    case 'boar':
    case 'elothere':
      return 'boar';
    case 'cats':
      return 'cat';
    case 'dogs':
      return 'dog';
    case 'birds-of-prey':
      return 'eagle';
    case 'horses':
      return 'horse';
    default:
      return 'unknown';
  }
};

/** Image of an NPC (an asset path): its own, or the one of its creature group. */
export const npcImage = (npc: Pick<Npc, 'imageUrl' | 'group' | 'source' | 'name'>): string =>
  npc.imageUrl || `images/npcs/${imageOf(npc)}.png`;

/** Category and level of an NPC, the line under its name. */
export const npcSummary = (npc: Pick<Npc, 'category' | 'level'>, t: Translate): string =>
  `${t(`npc-category-${npc.category}`)} · ${t('level')} ${npc.level}`;

/** Name of the environment faction of a tactical game (spec 055): the default one is translated. */
export const environmentFactionName = (name: string | null | undefined, t: Translate): string =>
  !name || name === DEFAULT_ENVIRONMENT_NAME ? t('environment-faction') : name;
