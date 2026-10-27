import { ItemAntidote, ItemPoison } from './poison.dto';

export type WeaponModeType = 'one-hand' | 'two-hands';
export type WeaponAttackType = 'melee' | 'ranged' | 'thrown';
export type ItemArmorSlot = 'head' | 'body' | 'arms' | 'legs';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare';
export type ItemModifierType = 'bonus' | 'item-damage' | 'skill-bonus' | 'material' | 'slayer';
export type OptionType = 'required' | 'optional' | 'forbidden';
export type ItemArmorClass = 'light' | 'medium' | 'heavy';

/** Categories of the item catalog; spec 041 adds the general equipment ones (container to instrument). */
export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'shield',
  'clothes',
  'coins',
  'tools',
  'food',
  'ammunition',
  'container',
  'light',
  'mount',
  'vehicle',
  'service',
  'instrument',
  'poison',
  'herb',
  'other',
] as const;
export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

/** Optional blocks of the general equipment (spec 041): information, no rule reads them yet. */
export type ItemFeatures = {
  /** Pounds, cubic feet, gallons or units it holds. */
  container?: { weight: number | null; volume: number | null; liquid: number | null; units: number | null } | null;
  /** Radius lit in feet and hours of each load. */
  light?: { radius: number | null; durationHours: number | null } | null;
  /** Pounds a mount or a vehicle carries and its feet per round. */
  transport?: { capacity: number | null; speed: number | null } | null;
  /** Item types that shoot it and its attack size adjustment. */
  ammunition?: { launchers: string[]; sizeAdjustment: number } | null;
  /** Spec 042. */
  poison?: ItemPoison | null;
  antidote?: ItemAntidote | null;
};

export type Item = {
  id: string;
  name: string;
  realmId: string | null;
  category: string;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
  /** Spec 041. */
  features?: ItemFeatures | null;
  modifiers: ItemModifier[] | null;
  info: ItemInfo;
  description: string | null;
  imageUrl: string;
  owner: string;
};

export type ItemWeapon = {
  skillId: string;
  fumble: number;
  modes: WeaponMode[];
  /** What the type and the skill can't tell, for the fighting styles (spec 032): fencing, axe, whip... */
  tags?: string[];
};

export type ItemArmor = {
  slot: ItemArmorSlot;
  at: number;
  enc: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: string;
  /** Spec 041: the slots it covers, its slot among them (a full suit covers the four). */
  coverage?: ItemArmorSlot[];
  /** Spec 041: light, medium or heavy helmet, vambraces or greaves. */
  class?: ItemArmorClass;
};

export type WeaponMode = {
  type: WeaponModeType;
  attackTypes: WeaponAttackType[];
  attackTable: string;
  fumbleTable: string;
  sizeAdjustment: number;
  ranges: WeaponRange[] | null;
  /** Spec 041: OB modifier of the mode, such as the penalty of an improvised weapon. */
  obModifier?: number;
};

export type WeaponRange = {
  from: number;
  to: number;
  bonus: number;
};

export type ItemShield = {
  db: number;
  blockCount: number;
};

export type ItemCost = {
  min: number;
  average: number;
  max: number;
};

export type ItemInfo = {
  cost: ItemCost | null;
  length: number | null;
  weight: number | null;
  strength: number | null;
  productionHours: number | null;
  stackable: boolean;
  rarity: ItemRarity;
  unique: boolean;
  /** Spec 041: units of the lot the book sells (cost and weight are per unit). */
  lotSize?: number | null;
};

export interface ItemModifier {
  id: string;
  type: ItemModifierType;
  value: number | null;
  modifier: string | null;
  specialization: string | null;
}

export interface CreateItemDto {
  id: string;
  realmId: string;
  category: string;
  weapon: Partial<ItemWeapon> | undefined;
  armor: Partial<ItemArmor> | undefined;
  shield: Partial<ItemShield> | undefined;
  features?: ItemFeatures | null;
  info: Partial<ItemInfo> | undefined;
  description: string | undefined;
  imageUrl?: string;
}

export interface UpdateItemDto {
  realmId: string | undefined;
  weapon: Partial<ItemWeapon> | undefined;
  armor: Partial<ItemArmor> | undefined;
  shield: Partial<ItemShield> | undefined;
  /** Spec 041: null removes the blocks. */
  features?: ItemFeatures | null;
  info: Partial<ItemInfo> | undefined;
  stackable: boolean | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
}

export interface ItemModifierOption {
  modifierType: ItemModifierType;
  selectorType: string;
  value: OptionType;
  modifier: OptionType;
  specialization: OptionType;
}
