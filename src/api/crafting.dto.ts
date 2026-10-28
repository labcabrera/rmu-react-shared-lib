import { ItemWeapon } from './item.dto';

/** Families of the superior materials of rmu-api-core (workspace spec 043). */
export type MaterialGroup = 'metal' | 'wood' | 'bow-wood' | 'stone' | 'cloth' | 'leather' | 'other';
export const MATERIAL_GROUPS: MaterialGroup[] = ['metal', 'wood', 'bow-wood', 'stone', 'cloth', 'leather', 'other'];

export type MaterialUse = 'weapon' | 'ammunition' | 'launcher' | 'armor' | 'shield';

/** A superior material (GET /v1/materials of rmu-api-core). Costs in gold. */
export type Material = {
  id: string;
  group: MaterialGroup;
  durability: number;
  /** Crafting modifier and percent less production time; null is special */
  workability: number | null;
  bonus: number;
  bluntBonus: number | null;
  metalBonus: number | null;
  cost: { add: number | null; multiplier: number | null };
  costPerPound: number | null;
  density: number | null;
  magical: boolean;
  alloy: boolean;
  alloyDifficulty: string | null;
  armorWeightMultiplier: number | null;
  uses: MaterialUse[];
};

/** What a crafted item is for the quality rules: where its bonuses go and which materials it takes. */
export type CraftKind = 'weapon' | 'ammunition' | 'launcher' | 'torso-armor' | 'armor' | 'shield' | 'other';

const CRAFT_MATERIAL_USE: Record<CraftKind, MaterialUse | null> = {
  weapon: 'weapon',
  ammunition: 'ammunition',
  launcher: 'launcher',
  'torso-armor': 'armor',
  armor: 'armor',
  shield: 'shield',
  other: null,
};

/** Weapon skills of the launchers (their bonus is to the range increment). */
export const LAUNCHER_SKILLS = ['ranged-weapon@bow', 'ranged-weapon@crossbow', 'ranged-weapon@sling'];

/** Attack tables of the blunt weapons: the default of the blunt switch (some metals give them another bonus). */
export const BLUNT_ATTACK_TABLES = ['club', 'fighting-stick', 'flail', 'mace', 'war-hammer'];

type CraftableItem = {
  category: string;
  weapon: Pick<ItemWeapon, 'skillId' | 'modes'> | null;
  armor: { slot: string } | null;
  shield: unknown;
};

/** The kind of a catalog item type, as rmu-api-strategic derives it. */
export const craftKind = (item: CraftableItem): CraftKind => {
  if (item.category === 'ammunition') return 'ammunition';
  if (item.weapon) return LAUNCHER_SKILLS.includes(item.weapon.skillId) ? 'launcher' : 'weapon';
  if (item.shield) return 'shield';
  if (item.armor) return item.armor.slot === 'body' ? 'torso-armor' : 'armor';
  return 'other';
};

export const isBluntWeapon = (item: CraftableItem): boolean =>
  !!item.weapon?.modes?.some((mode) => BLUNT_ATTACK_TABLES.includes(mode.attackTable));

/** Materials a kind of item can be made of. */
export const materialsFor = (kind: CraftKind, materials: Material[]): Material[] => {
  const use = CRAFT_MATERIAL_USE[kind];
  return use ? materials.filter((material) => material.uses.includes(use)) : [];
};

export type WorkshopQuality = 'inferior' | 'basic' | 'superior-5' | 'superior-10' | 'superior-15' | 'superior-20';
export const WORKSHOP_QUALITIES: WorkshopQuality[] = [
  'inferior',
  'basic',
  'superior-5',
  'superior-10',
  'superior-15',
  'superior-20',
];

export type MasterworkKind = 'general' | 'circumstantial';
export const MASTERWORK_KINDS: MasterworkKind[] = ['general', 'circumstantial'];

/** Torso armor weight changes in percent (lighter down to -25%, heavier up to +50%). */
export const ARMOR_WEIGHT_PERCENTS = [-25, -20, -15, -10, -5, 10, 20, 30, 40, 50];

/** The quality the craftsman aims at (POST /v1/items/crafts and /crafts/quote). */
export type CraftingQualityDto = {
  materialId?: string;
  blunt?: boolean;
  replacesMetal?: boolean;
  masterwork?: MasterworkKind;
  circumstance?: string;
  weightPercent?: number;
  workshop?: WorkshopQuality;
};

export type QuoteCraftDto = {
  itemTypeId: string;
  amount?: number;
  quality?: CraftingQualityDto;
  materialsCost?: number;
  enhancementsCost?: number;
};

/** How an item will be crafted: cost, maneuver modifiers, hours and the bonuses it will get. */
export type CraftingPlan = {
  kind: CraftKind;
  amount: number;
  material: { id: string; bonus: number; durability: number; workability: number | null; magical: boolean } | null;
  /** Use of the item the material and masterwork bonuses apply to; null: the range increment, or none */
  bonusTarget: 'attack' | 'defense' | 'maneuver' | null;
  masterwork: MasterworkKind | null;
  circumstance: string | null;
  weightPercent: number | null;
  weightDb: number;
  weightMultiplier: number;
  workshop: WorkshopQuality;
  modifiers: { key: string; value: number }[];
  productionHours: number | null;
  cost: {
    unitBase: number;
    unitMaterial: number;
    unitPrice: number;
    materials: number;
    enhancements: number;
    total: number;
    asked: boolean;
  };
};

/** Superior material a crafted item was made of. */
export type ItemMaterial = { id: string; bonus: number; durability: number; magical: boolean };

/** Circumstance of the bonuses of a launcher: they lengthen its range increment. */
export const RANGE_INCREMENT_CONDITION = 'range-increment';
