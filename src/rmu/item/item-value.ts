import type { ItemFeatures } from '../../api/item.dto';
import type { StrategicItem } from '../../api/strategic-item.dto';
import type { ItemSize, JewelryClass } from '../../api/treasure-goods.dto';

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

/** Float noise off, without rounding small prices (0.005 sp is 0.0005 gp) to copper. */
const clean = (value: number): number => Math.round(value * 1e9) / 1e9;

const steps = (size: ItemSize | null | undefined): number => (size ? ITEM_SIZE_STEPS[size] : 0);

/** Multiplier of the cost and the weight of an item of that size (null is medium). */
export const itemSizeFactor = (size: ItemSize | null | undefined): number => Math.pow(4, steps(size));

/** Multiplier of the length of an item of that size. */
export const itemSizeLengthFactor = (size: ItemSize | null | undefined): number => Math.pow(1.6, steps(size));

/** Weight of an item of that size; null stays null. */
export const itemSizeWeight = (weight: number | null | undefined, size: ItemSize | null | undefined): number | null =>
  weight === null || weight === undefined ? null : clean(weight * itemSizeFactor(size));

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
  /** Jewelry: base value rolled or entered, before the class factor; the middle of the range when missing. */
  value?: number | null;
};

/**
 * Gold of one unit (spec 062 §3):
 * - a gem: value per carat × carats × cut factor (null without carats);
 * - a jewel: base value × the factor of its class (`quality` by default) × the size factor;
 * - anything else: catalog cost × 4 per size category from medium.
 *
 * Null when there is nothing to price.
 */
export const itemUnitValue = (source: UnitValueSource): number | null => {
  const { features } = source;
  if (source.category === 'gem' || features?.gem) {
    const perCarat = features?.gem?.valuePerCarat;
    if (perCarat === undefined || perCarat === null || !source.carats) return null;
    return clean(perCarat * source.carats * (source.cutFactor ?? 1));
  }
  if (source.category === 'jewelry' && features?.jewelry) {
    const base = source.value ?? jewelryBaseAverage(features);
    if (base === null) return null;
    const factor = JEWELRY_CLASS_FACTORS[source.jewelryClass ?? DEFAULT_JEWELRY_CLASS];
    return clean(base * factor * itemSizeFactor(source.size));
  }
  if (source.cost === undefined || source.cost === null) return null;
  return clean(source.cost * itemSizeFactor(source.size));
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
