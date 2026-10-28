// Fallback images per entity kind (spec 046, decision 10). Paths are relative to rmu-mfe-assets, like the ones the
// APIs store, and only point to files that exist in `images/generic` or `images/items`.
import { resolveAssetUrl } from './asset-url';

export type EntityKind =
  | 'realm'
  | 'race'
  | 'culture'
  | 'profession'
  | 'skill'
  | 'skill-category'
  | 'trait'
  | 'spell'
  | 'spell-list'
  | 'item'
  | 'faction'
  | 'strategic-game'
  | 'tactical-game'
  | 'npc'
  | 'character'
  | 'attack-table'
  | 'generic';

/** Fallback image of each entity kind, as an asset path. */
export const defaultImages: Readonly<Record<EntityKind, string>> = {
  realm: 'images/generic/realm.png',
  race: 'images/generic/races.png',
  culture: 'images/generic/cultures.png',
  profession: 'images/generic/professions.png',
  skill: 'images/generic/skills.png',
  'skill-category': 'images/generic/skills.png',
  trait: 'images/generic/trait.png',
  spell: 'images/generic/spells.png',
  'spell-list': 'images/generic/spells.png',
  item: 'images/generic/items.png',
  faction: 'images/generic/faction.png',
  'strategic-game': 'images/generic/strategic.png',
  'tactical-game': 'images/generic/tactical.png',
  npc: 'images/generic/npcs.png',
  character: 'images/generic/warrior.png',
  'attack-table': 'images/generic/armor.png',
  generic: 'images/generic/configuration.png',
};

/** Item categories with their own `images/items/category-<category>.png`; the others use `items.png` (decision 10). */
export const ITEM_CATEGORIES_WITH_IMAGE: readonly string[] = [
  'weapon',
  'armor',
  'shield',
  'clothes',
  'tools',
  'food',
  'ammunition',
];

/** Asset path of the image of an item category, or of `images/generic/items.png` when it has none yet. */
export const itemCategoryImage = (category: string | null | undefined): string =>
  category && ITEM_CATEGORIES_WITH_IMAGE.includes(category)
    ? `images/items/category-${category}.png`
    : defaultImages.item;

/** URL of the image of an entity: its own (`url`), or the fallback of its kind. */
export const entityImage = (kind: EntityKind, url?: string | null): string =>
  resolveAssetUrl(url || defaultImages[kind] || defaultImages.generic);
