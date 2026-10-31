import type { ItemFeatures } from '../../api/item.dto';
import type { StrategicItem } from '../../api/strategic-item.dto';
import type { ItemSize, JewelryClass } from '../../api/treasure-goods.dto';
import { roundGold } from './money';

// Unit value of an item of spec 062 (gold), the same rule rmu-api-strategic applies to purchases and price quotes.

/** Size categories from medium: cost and weight ×4 per step, length ×1.6. */
export const ITEM_SIZE_STEPS: Record<ItemSize, number> = { small: -1, medium: 0, big: 1, large: 2 };

/** Gold of the class factor of a jewel (the book's ×0.01, 0.1, 1, 10 and 100 sp). */
export const JEWELRY_CLASS_FACTORS: Record<JewelryClass, number> = {
  junk: 0.001,
  costume: 0.01,
  quality: 0.1,
  fine: 1,
  extravagant: 10,
};

/** The class a jewel takes when none is given, the one of the indicative catalog cost. */
export const DEFAULT_JEWELRY_CLASS: JewelryClass = 'quality';

const steps = (size: ItemSize | null | undefined): number => (size ? ITEM_SIZE_STEPS[size] : 0);

/** Multiplier of the cost and the weight of an item of that size (null is medium). */
export const itemSizeFactor = (size: ItemSize | null | undefined): number => Math.pow(4, steps(size));

/** Multiplier of the length of an item of that size. */
export const itemSizeLengthFactor = (size: ItemSize | null | undefined): number => Math.pow(1.6, steps(size));

/** Weight of an item of that size; null stays null. */
export const itemSizeWeight = (weight: number | null | undefined, size: ItemSize | null | undefined): number | null =>
  weight === null || weight === undefined
    ? null
    : steps(size) === 0
      ? weight
      : Math.round(weight * itemSizeFactor(size) * 100) / 100;

/** The middle of the base range of a jewelry type, before the class factor. */
export const jewelryBaseAverage = (features: ItemFeatures | null | undefined): number | null => {
  const range = features?.jewelry?.value;
  return range ? (range.min + range.max) / 2 : null;
};

/** What the unit value reads: the catalog type and the instance data of spec 062. */
export type UnitValueSource = {
  category: string;
  /** Average catalog gold of one unit. */
  cost?: number | null;
  features?: ItemFeatures | null;
  size?: ItemSize | null;
  carats?: number | null;
  cutFactor?: number | null;
  jewelryClass?: JewelryClass | null;
  /** Jewelry: base value rolled or entered, before the class factor; without it the catalog cost is used. */
  value?: number | null;
};

/**
 * Gold of one unit (spec 062 §3), the `ItemUnitValue.unitValue` of rmu-api-strategic:
 * - a gem: value per carat × carats (1 by default) × cut factor; its catalog cost without a value per carat;
 * - a jewel with a base value: base × the gold factor of its class (`quality` by default) × the size factor;
 * - anything else, a jewel without a base value too: catalog cost × 4 per size category from medium (a jewel also by
 *   its class against `quality`, the class of the catalog cost).
 *
 * Rounded to copper like every price, except an unscaled catalog cost. Null when there is nothing to price.
 */
export const itemUnitValue = (source: UnitValueSource): number | null => {
  const { features } = source;
  const factor = itemSizeFactor(source.size);
  if (source.category === 'gem') {
    const perCarat = features?.gem?.valuePerCarat;
    if (perCarat === undefined || perCarat === null) return source.cost ?? null;
    return roundGold(perCarat * (source.carats ?? 1) * (source.cutFactor ?? 1));
  }
  const jewel = source.category === 'jewelry';
  if (jewel && source.value !== undefined && source.value !== null) {
    const base = roundGold(source.value * JEWELRY_CLASS_FACTORS[source.jewelryClass ?? DEFAULT_JEWELRY_CLASS]);
    return roundGold(base * factor);
  }
  if (source.cost === undefined || source.cost === null) return null;
  const classFactor =
    jewel && source.jewelryClass
      ? JEWELRY_CLASS_FACTORS[source.jewelryClass] / JEWELRY_CLASS_FACTORS[DEFAULT_JEWELRY_CLASS]
      : 1;
  return factor === 1 && classFactor === 1 ? source.cost : roundGold(source.cost * classFactor * factor);
};

/** Unit value of a catalog item bought with that instance data (the market preview). */
export const catalogUnitValue = (
  item: { category: string; info: { cost: { average: number } | null }; features?: ItemFeatures | null },
  options: Omit<UnitValueSource, 'category' | 'cost' | 'features'> = {}
): number | null =>
  itemUnitValue({ category: item.category, cost: item.info.cost?.average, features: item.features, ...options });

/**
 * Unit value of an owned item: the `value` strategic keeps, or the one worked out from its catalog copy and its
 * instance data (older items).
 */
export const strategicItemUnitValue = (item: StrategicItem): number => {
  if (item.value !== undefined && item.value !== null) return item.value;
  return (
    itemUnitValue({
      category: item.category,
      cost: item.catalog?.cost?.average ?? item.info?.cost?.average,
      features: item.catalog?.features,
      size: item.size,
      carats: item.carats,
      cutFactor: item.cutFactor,
      jewelryClass: item.jewelryClass,
    }) ?? 0
  );
};
