import { NamedEntity } from './common.dto';

export type WeaponModeType = 'one-hand' | 'two-hands';
export type WeaponAttackType = 'melee' | 'ranged' | 'thrown';
export type ItemModifierType = 'bonus' | 'breakage' | 'skill-bonus' | 'material';
export type ItemArmorSlot = 'head' | 'body' | 'arms' | 'legs';

export type Item = {
  id: string;
  realm: NamedEntity | undefined;
  category: string;
  weapon: ItemWeapon | undefined;
  armor: ItemArmor | undefined;
  shield: ItemShield | undefined;
  info: ItemInfo;
  description: string | undefined;
  imageUrl?: string;
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
  maneuver: number;
  rangedPenalty: number;
  perception: number;
  baseDifficulty: string;
};

export type WeaponMode = {
  type: WeaponModeType;
  attackTypes: WeaponAttackType[];
  attackTable: string;
  fumbleTable: string;
  sizeAdjustment: number;
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

export type ItemInfo = {
  cost: {
    min: number;
    average: number;
    max: number;
  };
  length: number | null;
  weight: number | null;
  weightPercent: number | null;
  strength: number | null;
  productionHours: number | null;
  stackable: boolean;
};

export interface ItemModifier {
  readonly id: string;
  readonly type: ItemModifierType;
  readonly modifier: string | undefined;
  readonly value: number | undefined;
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
