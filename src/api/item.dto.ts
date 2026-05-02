import { NamedEntity } from './common.dto';

export type WeaponModeType = 'one-hand' | 'two-hands';
export type WeaponAttackType = 'melee' | 'ranged' | 'thrown';
export type ItemModifierType = 'bonus' | 'breakage' | 'skill-bonus' | 'material';
export type ItemArmorSlot = 'head' | 'body' | 'arms' | 'legs';
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare';

export type Item = {
  id: string;
  name: string;
  realmId: string | null;
  category: string;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
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
};

export type ItemArmor = {
  slot: ItemArmorSlot;
  at: number;
  enc: number;
  maneuverPenalty: number;
  rangedPenalty: number;
  perceptionPenalty: number;
  baseDifficulty: string;
};

export type WeaponMode = {
  type: WeaponModeType;
  attackTypes: WeaponAttackType[];
  attackTable: string;
  fumbleTable: string;
  sizeAdjustment: number;
  ranges: WeaponRange[] | null;
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
};

export interface ItemModifier {
  id: string;
  type: ItemModifierType;
  value: number | null;
  modifier: string | null;
}

export interface CreateItemDto {
  id: string;
  realmId: string;
  category: string;
  weapon: Partial<ItemWeapon> | undefined;
  armor: Partial<ItemArmor> | undefined;
  shield: Partial<ItemShield> | undefined;
  info: Partial<ItemInfo> | undefined;
  description: string | undefined;
  imageUrl?: string;
}

export interface UpdateItemDto {
  realmId: string | undefined;
  weapon: Partial<ItemWeapon> | undefined;
  armor: Partial<ItemArmor> | undefined;
  shield: Partial<ItemShield> | undefined;
  info: Partial<ItemInfo> | undefined;
  stackable: boolean | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
}

export interface ItemModifierOption {
  modifierType: ItemModifierType;
  selectorType: string | null;
  allowValue: boolean;
  allowModifier: boolean;
  allowSpecialization: boolean;
}
