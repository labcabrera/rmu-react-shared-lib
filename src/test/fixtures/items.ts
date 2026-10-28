import { Item, ItemArmor, ItemArmorSlot } from '../../api/item.dto';

/** A catalog item with sensible defaults; `overrides` replaces whole blocks. */
export const catalogItem = (overrides: Partial<Item> & Pick<Item, 'id'>): Item => ({
  name: overrides.id,
  realmId: 'realm-1',
  category: 'tools',
  weapon: null,
  armor: null,
  shield: null,
  features: null,
  modifiers: null,
  info: {
    cost: { min: 1, average: 2, max: 3 },
    length: null,
    weight: 1,
    strength: null,
    productionHours: null,
    stackable: false,
    rarity: 'common',
    unique: false,
  },
  description: null,
  imageUrl: '',
  owner: 'system',
  ...overrides,
});

const armor = (slot: ItemArmorSlot, at: number, extra: Partial<ItemArmor> = {}): ItemArmor => ({
  slot,
  at,
  enc: 2,
  maneuverPenalty: -10,
  rangedPenalty: 0,
  perceptionPenalty: 0,
  baseDifficulty: 'medium',
  ...extra,
});

/** A small catalog: plate pieces and suit (AT 8), a leather helmet (AT 2), weapons, a shield, a lantern and a bag. */
export const sampleCatalog: Item[] = [
  ...(['head', 'body', 'arms', 'legs'] as ItemArmorSlot[]).map((slot) =>
    catalogItem({ id: `plate-${slot}`, name: `plate-${slot}`, category: 'armor', armor: armor(slot, 8) })
  ),
  catalogItem({
    id: 'plate-full',
    category: 'armor',
    armor: armor('body', 8, { coverage: ['head', 'body', 'arms', 'legs'], enc: 6 }),
    info: { ...catalogItem({ id: 'x' }).info, cost: { min: 100, average: 200, max: 300 }, weight: 50 },
  }),
  catalogItem({
    id: 'leather-helmet',
    category: 'armor',
    armor: armor('head', 2, { class: 'light' }),
    info: { ...catalogItem({ id: 'x' }).info, rarity: 'uncommon' },
  }),
  catalogItem({
    id: 'battle-axe',
    category: 'weapon',
    weapon: {
      skillId: 'melee-weapon@hafted',
      fumble: 4,
      modes: [
        {
          type: 'two-hands',
          attackTypes: ['melee'],
          attackTable: 'battle-axe',
          fumbleTable: 'hafted',
          sizeAdjustment: 0,
          ranges: null,
        },
      ],
    },
    info: { ...catalogItem({ id: 'x' }).info, cost: { min: 5, average: 10, max: 15 }, weight: 6 },
  }),
  catalogItem({
    id: 'dagger',
    category: 'weapon',
    owner: 'user-1',
    weapon: {
      skillId: 'melee-weapon@blade',
      fumble: 1,
      modes: [
        {
          type: 'one-hand',
          attackTypes: ['melee', 'thrown'],
          attackTable: 'dagger',
          fumbleTable: 'blade',
          sizeAdjustment: 0,
          ranges: null,
        },
      ],
    },
  }),
  catalogItem({ id: 'normal-shield', category: 'shield', shield: { db: 20, blockCount: 2 } }),
  catalogItem({ id: 'lantern', category: 'light', features: { light: { radius: 30, durationHours: 6 } } }),
  catalogItem({
    id: 'backpack',
    category: 'container',
    features: { container: { weight: 20, volume: 2, liquid: null, units: null } },
    info: { ...catalogItem({ id: 'x' }).info, cost: null, weight: null },
  }),
];
