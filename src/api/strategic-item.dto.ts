import { ItemMaterial } from './crafting.dto';
import type { ItemEnchantment } from './enchantment.dto';
import type { ItemCharges, ItemGemSetting } from './magic-item.dto';
import { ItemCondition, StrategicItemModifier } from './item-modifier.dto';
import { ItemArmor, ItemCost, ItemFeatures, ItemInfo, ItemShield, ItemWeapon } from './item.dto';
import { ItemCoating } from './poison.dto';
import type { ItemSize, JewelryClass } from './treasure-goods.dto';

/** Who holds an item (spec 023): a character or a faction (its armory) of the same game. */
export type ItemHolderKind = 'character' | 'faction';

export type ItemHolder = {
  kind: ItemHolderKind;
  id: string;
};

/** What an item keeps of its catalog type (spec 023). */
export type StrategicItemCatalog = {
  cost: ItemCost | null;
  rarity: string | null;
  productionHours: number | null;
  imageUrl: string | null;
  /** Spec 041. */
  lotSize?: number | null;
  features?: ItemFeatures | null;
};

export type StrategicItem = {
  id: string;
  gameId: string;
  factionId: string | null;
  characterId: string | null;
  itemTypeId: string;
  name: string;
  category: string;
  carried: boolean;
  weapon: ItemWeapon | null;
  armor: ItemArmor | null;
  shield: ItemShield | null;
  amount: number;
  info: ItemInfo;
  /** Breakage, quality... (spec 019). Missing in strategic versions before it. */
  modifiers?: StrategicItemModifier[];
  condition?: ItemCondition;
  /** Spec 023: missing in strategic versions before it. */
  holder?: ItemHolder;
  catalog?: StrategicItemCatalog | null;
  /** Reference gold of one unit. */
  value?: number;
  /** Gold paid for one unit when it was bought or crafted. */
  acquiredPrice?: number | null;
  description?: string | null;
  /** Poison on a weapon (spec 042). */
  coating?: ItemCoating | null;
  /** Superior material it was crafted of (spec 043). */
  material?: ItemMaterial | null;
  /** Spec 062: null is medium; a weapon mirrors its `wielderSize`. */
  size?: ItemSize | null;
  /** Spec 062: carats of a gem. */
  carats?: number | null;
  /** Spec 062: class of a jewel. */
  jewelryClass?: JewelryClass | null;
  /** Spec 062: multiplier of a modern cut of a gem (1, 5, 10). */
  cutFactor?: number | null;
  /** Spec 064: the enchantment of the item. */
  enchantment?: ItemEnchantment | null;
  /** Spec 067: charges of a charged item. */
  charges?: ItemCharges | null;
  /** Spec 067: gems set in the item; its value includes theirs. */
  settings?: ItemGemSetting[];
  owner: string;
};

/** The holder of an item, also for strategic versions before spec 023. */
export const itemHolder = (item: Pick<StrategicItem, 'holder' | 'characterId' | 'factionId'>): ItemHolder | null => {
  if (item.holder) return item.holder;
  if (item.characterId) return { kind: 'character', id: item.characterId };
  if (item.factionId) return { kind: 'faction', id: item.factionId };
  return null;
};

/** Units of an item: the stack amount, or 1. */
export const itemUnits = (item: Pick<StrategicItem, 'amount' | 'info'>): number =>
  item.info?.stackable ? (item.amount ?? 1) : 1;
