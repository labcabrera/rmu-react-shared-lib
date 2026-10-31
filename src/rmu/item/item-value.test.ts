import { describe, expect, it } from 'vitest';
import type { ItemFeatures } from '../../api/item.dto';
import type { StrategicItem } from '../../api/strategic-item.dto';
import {
  catalogUnitValue,
  itemSizeFactor,
  itemSizeLengthFactor,
  itemSizeWeight,
  itemUnitValue,
  jewelryBaseAverage,
  strategicItemUnitValue,
} from './item-value';

// Synthetic fixtures, never book rows.
const gem: ItemFeatures = {
  gem: {
    grade: 'precious',
    mineral: 'test-stone',
    valuePerCarat: 2,
    hardness: null,
    specificGravity: null,
    luster: null,
    caratsPerCm: null,
    magic: null,
  },
};
const jewel: ItemFeatures = { jewelry: { value: { min: 10, max: 30, dice: null, openEnded: false }, slot: 'finger' } };

describe('itemUnitValue (spec 062)', () => {
  it('prices a gem by value per carat, carats and cut', () => {
    expect(itemUnitValue({ category: 'gem', features: gem, carats: 5 })).toBe(10);
    expect(itemUnitValue({ category: 'gem', features: gem, carats: 5, cutFactor: 5 })).toBe(50);
    expect(itemUnitValue({ category: 'gem', features: gem, carats: 0.5, cutFactor: 10 })).toBe(10);
  });

  it('takes one carat by default, and the catalog cost without a value per carat', () => {
    expect(itemUnitValue({ category: 'gem', features: gem })).toBe(2);
    expect(itemUnitValue({ category: 'gem', features: {}, carats: 3, cost: 7 })).toBe(7);
    expect(itemUnitValue({ category: 'gem', features: {}, carats: 3 })).toBeNull();
  });

  it('prices a jewel by its base value and the gold factor of its class', () => {
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20, jewelryClass: 'fine' })).toBe(20);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20, jewelryClass: 'extravagant' })).toBe(200);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20, jewelryClass: 'junk' })).toBe(0.02);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20, jewelryClass: 'costume' })).toBe(0.2);
  });

  it('takes the catalog cost, of the quality class, without a base value', () => {
    expect(jewelryBaseAverage(jewel)).toBe(20);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, cost: 2 })).toBe(2);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, cost: 2, jewelryClass: 'fine' })).toBe(20);
    expect(itemUnitValue({ category: 'jewelry', features: jewel, cost: 2, jewelryClass: 'junk', size: 'big' })).toBe(
      0.08
    );
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20 })).toBe(2);
  });

  it('scales a jewel of another size', () => {
    expect(itemUnitValue({ category: 'jewelry', features: jewel, value: 20, jewelryClass: 'fine', size: 'big' })).toBe(
      80
    );
  });

  it('multiplies the cost by 4 per size category from medium', () => {
    expect(itemUnitValue({ category: 'weapon', cost: 10 })).toBe(10);
    expect(itemUnitValue({ category: 'weapon', cost: 10, size: 'medium' })).toBe(10);
    expect(itemUnitValue({ category: 'weapon', cost: 10, size: 'small' })).toBe(2.5);
    expect(itemUnitValue({ category: 'weapon', cost: 10, size: 'big' })).toBe(40);
    expect(itemUnitValue({ category: 'armor', cost: 10, size: 'large' })).toBe(160);
    expect(itemUnitValue({ category: 'tools', cost: null })).toBeNull();
  });

  it('keeps an unscaled catalog cost and rounds a scaled one to copper, as strategic does', () => {
    // 0.005 sp is 0.0005 gp
    expect(itemUnitValue({ category: 'herb', cost: 0.0005 })).toBe(0.0005);
    expect(itemUnitValue({ category: 'herb', cost: 0.0005, size: 'big' })).toBe(0.002);
    expect(itemUnitValue({ category: 'herb', cost: 0.0005, size: 'small' })).toBe(0);
  });

  it('scales weight and length with the size', () => {
    expect(itemSizeFactor(null)).toBe(1);
    expect(itemSizeFactor('large')).toBe(16);
    expect(itemSizeWeight(3, 'big')).toBe(12);
    expect(itemSizeWeight(null, 'big')).toBeNull();
    expect(itemSizeLengthFactor('big')).toBeCloseTo(1.6);
    expect(itemSizeLengthFactor('small')).toBeCloseTo(0.625);
  });

  it('prices a catalog item with the options of a purchase', () => {
    const item = { category: 'weapon', info: { cost: { average: 5 } }, features: null };
    expect(catalogUnitValue(item, { size: 'big' })).toBe(20);
    expect(catalogUnitValue({ category: 'gem', info: { cost: null }, features: gem }, { carats: 2 })).toBe(4);
  });

  it('prefers the value strategic keeps for an owned item', () => {
    const owned = {
      category: 'gem',
      value: 99,
      carats: 1,
      catalog: { features: gem, cost: null, rarity: null, productionHours: null, imageUrl: null },
    } as unknown as StrategicItem;
    expect(strategicItemUnitValue(owned)).toBe(99);
    expect(strategicItemUnitValue({ ...owned, value: undefined, carats: 3 })).toBe(6);
    expect(strategicItemUnitValue({ ...owned, value: undefined, carats: null })).toBe(2);
  });
});
