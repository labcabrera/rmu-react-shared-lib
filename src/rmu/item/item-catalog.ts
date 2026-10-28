import { ITEM_RARITIES } from '../../api/constants';
import { ITEM_CATEGORIES, Item, ItemArmorClass, WeaponAttackType, WeaponModeType } from '../../api/item.dto';
import { Realm } from '../../api/realm.dto';
import { FilterSchema } from '../../data/useListFilters';
import { ItemFeatureTranslate } from './ItemFeatureChips';

/** The weapon skills of the catalog (spec 046, decision 11): 8 melee and 5 ranged specializations. */
export const WEAPON_SKILLS: readonly { id: string; group: 'melee-weapon' | 'ranged-weapon' }[] = [
  { id: 'melee-weapon@blade', group: 'melee-weapon' },
  { id: 'melee-weapon@greater-blade', group: 'melee-weapon' },
  { id: 'melee-weapon@hafted', group: 'melee-weapon' },
  { id: 'melee-weapon@greater-hafted', group: 'melee-weapon' },
  { id: 'melee-weapon@chain', group: 'melee-weapon' },
  { id: 'melee-weapon@greater-chain', group: 'melee-weapon' },
  { id: 'melee-weapon@pole-arm', group: 'melee-weapon' },
  { id: 'melee-weapon@exotic', group: 'melee-weapon' },
  { id: 'ranged-weapon@bow', group: 'ranged-weapon' },
  { id: 'ranged-weapon@crossbow', group: 'ranged-weapon' },
  { id: 'ranged-weapon@sling', group: 'ranged-weapon' },
  { id: 'ranged-weapon@thrown', group: 'ranged-weapon' },
  { id: 'ranged-weapon@exotic', group: 'ranged-weapon' },
];

/** Weapon skills with an `images/items/category-<skill>.png`. */
const WEAPON_SKILLS_WITH_IMAGE = [
  'melee-weapon@blade',
  'melee-weapon@chain',
  'melee-weapon@exotic',
  'melee-weapon@greater-blade',
  'melee-weapon@greater-hafted',
  'melee-weapon@hafted',
  'melee-weapon@pole-arm',
  'ranged-weapon@bow',
  'ranged-weapon@crossbow',
];

/** Image of a weapon skill: its own category image, or the one of weapons. */
export const weaponSkillImage = (skillId: string): string =>
  WEAPON_SKILLS_WITH_IMAGE.includes(skillId)
    ? `images/items/category-${skillId}.png`
    : 'images/items/category-weapon.png';

/** Label of a weapon skill: its specialization (`blade`), or the skill when it has none. */
export const weaponSkillLabel = (skillId: string, t: ItemFeatureTranslate): string =>
  t(skillId.includes('@') ? skillId.split('@')[1] : skillId);

export const ARMOR_TYPES = ['2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
/** Armor slots of the filter; `full` is a full suit (an armor with `coverage`). */
export const ARMOR_SLOT_FILTERS = ['head', 'body', 'arms', 'legs', 'full'] as const;
export const ARMOR_CLASSES: readonly ItemArmorClass[] = ['light', 'medium', 'heavy'];
export const WEAPON_HANDS: readonly WeaponModeType[] = ['one-hand', 'two-hands'];
export const WEAPON_ATTACKS: readonly WeaponAttackType[] = ['melee', 'ranged', 'thrown'];
/** General equipment features of the filter (spec 041 `features` blocks). */
export const ITEM_FEATURE_FILTERS = ['container', 'transport', 'ammunition', 'light'] as const;
export const ITEM_SORTS = ['name', 'cost', 'weight', 'at'] as const;
export type ItemSort = (typeof ITEM_SORTS)[number];
export const ITEM_PAGE_SIZES = [24, 48, 96];

/** Lower case and without accents, so «hacha» finds «Hacha» and «canción» finds «cancion». */
export const normalizeText = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const isFullSuit = (item: Item) => (item.armor?.coverage?.length ?? 0) > 0;
const list = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

export interface ItemCatalogFilterOptions {
  /** Realms, for the names of the realm filter. */
  realms?: Realm[];
  /** Id of the user: enables «only mine» (items whose `owner` it is). */
  owner?: string;
}

/**
 * Filters of the item catalog (spec 046, decision 11), for useListFilters: translated name, category, rarity, realm,
 * «only mine», and the contextual ones of armor (AT, slot, class) and weapons (skill, hands, attack), the general
 * equipment features, and the sort (`sort` and `dir`, not counted as filters). Everything is matched on the client.
 */
export const itemCatalogFilters = (
  t: ItemFeatureTranslate,
  { realms, owner }: ItemCatalogFilterOptions = {}
): FilterSchema<Item> => {
  const isArmor = (values: Record<string, unknown>) => values.category === 'armor';
  const isWeapon = (values: Record<string, unknown>) => values.category === 'weapon';
  return {
    q: {
      kind: 'text',
      label: t('name'),
      match: (item, value) => {
        const text = normalizeText(String(value).trim());
        return (
          !text || normalizeText(t(item.name, { defaultValue: item.name })).includes(text) || item.id.includes(text)
        );
      },
    },
    category: {
      kind: 'single',
      label: t('category'),
      options: ITEM_CATEGORIES,
      format: (value) => t(`item-category-${value}`, { defaultValue: t(value) }),
      match: (item, value) => item.category === value,
    },
    rarity: {
      kind: 'multiple',
      label: t('rarity'),
      options: ITEM_RARITIES,
      format: (value) => t(value),
      match: (item, value) => list(value).includes(item.info.rarity),
    },
    realm: {
      kind: 'single',
      label: t('realm'),
      format: (value) => {
        const realm = realms?.find((each) => each.id === value);
        return realm ? t(realm.name) : value;
      },
      match: (item, value) => item.realmId === value,
    },
    mine: {
      kind: 'single',
      label: t('item-filter-mine'),
      options: ['true'],
      format: () => t('yes'),
      when: () => !!owner,
      match: (item) => item.owner === owner,
    },
    at: {
      kind: 'multiple',
      label: t('at-short'),
      options: ARMOR_TYPES,
      when: isArmor,
      match: (item, value) => !!item.armor && list(value).includes(String(item.armor.at)),
    },
    slot: {
      kind: 'single',
      label: t('slot'),
      options: ARMOR_SLOT_FILTERS,
      format: (value) => t(value),
      when: isArmor,
      match: (item, value) =>
        !!item.armor && (value === 'full' ? isFullSuit(item) : !isFullSuit(item) && item.armor.slot === value),
    },
    class: {
      kind: 'single',
      label: t('armor-class'),
      options: ARMOR_CLASSES,
      format: (value) => t(`item-armor-class-${value}`),
      when: isArmor,
      match: (item, value) => item.armor?.class === value,
    },
    skill: {
      kind: 'multiple',
      label: t('skill'),
      options: WEAPON_SKILLS.map((skill) => skill.id),
      format: (value) => weaponSkillLabel(value, t),
      when: isWeapon,
      match: (item, value) => !!item.weapon && list(value).includes(item.weapon.skillId),
    },
    hands: {
      kind: 'single',
      label: t('hands'),
      options: WEAPON_HANDS,
      format: (value) => t(value),
      when: isWeapon,
      match: (item, value) => !!item.weapon?.modes.some((mode) => mode.type === value),
    },
    attack: {
      kind: 'single',
      label: t('attack-type'),
      options: WEAPON_ATTACKS,
      format: (value) => t(value),
      when: isWeapon,
      match: (item, value) => !!item.weapon?.modes.some((mode) => mode.attackTypes.includes(value as WeaponAttackType)),
    },
    feature: {
      kind: 'multiple',
      label: t('features'),
      options: ITEM_FEATURE_FILTERS,
      format: (value) => t(`item-filter-feature-${value}`),
      match: (item, value) =>
        list(value).every((feature) => !!item.features?.[feature as (typeof ITEM_FEATURE_FILTERS)[number]]),
    },
    sort: { kind: 'single', label: t('sort-order'), options: ITEM_SORTS, defaultValue: 'name', chip: false },
    dir: { kind: 'single', label: t('sort-order'), options: ['asc', 'desc'], defaultValue: 'asc', chip: false },
  };
};

const sortValue = (item: Item, sort: ItemSort): number | null => {
  if (sort === 'cost') return item.info.cost?.average ?? null;
  if (sort === 'weight') return item.info.weight ?? null;
  if (sort === 'at') return item.armor?.at ?? null;
  return null;
};

/**
 * The items sorted by translated name (default), average cost, weight or AT (decision 12), ascending or descending.
 * Items without the value go last; ties by name.
 */
export const sortItems = (
  items: Item[],
  sort: string | undefined,
  dir: string | undefined,
  t: ItemFeatureTranslate
): Item[] => {
  const by = (ITEM_SORTS as readonly string[]).includes(sort ?? '') ? (sort as ItemSort) : 'name';
  const sign = dir === 'desc' ? -1 : 1;
  const names = new Map(items.map((item) => [item.id, t(item.name, { defaultValue: item.name })]));
  const byName = (a: Item, b: Item) => names.get(a.id)!.localeCompare(names.get(b.id)!);
  return [...items].sort((a, b) => {
    if (by === 'name') return sign * byName(a, b);
    const va = sortValue(a, by);
    const vb = sortValue(b, by);
    if (va === null || vb === null) return va === vb ? byName(a, b) : va === null ? 1 : -1;
    return va === vb ? byName(a, b) : sign * (va - vb);
  });
};
