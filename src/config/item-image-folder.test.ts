import { describe, expect, it } from 'vitest';
import { itemImageUrl } from '../rmu/item/ItemThumb';
import { itemImageFolder } from './default-images';

describe('itemImageFolder', () => {
  it('puts weapons, armor and shields in their own folders', () => {
    expect(itemImageFolder('weapon')).toBe('weapons');
    expect(itemImageFolder('armor')).toBe('armor');
    expect(itemImageFolder('shield')).toBe('armor');
    expect(itemImageFolder('clothes')).toBe('items');
    expect(itemImageFolder(undefined)).toBe('items');
  });

  it('guesses the image of an item without one in the folder of its category', () => {
    expect(itemImageUrl({ id: 'dagger', category: 'weapon' })).toMatch(/images\/weapons\/dagger\.png$/);
    expect(itemImageUrl({ itemTypeId: 'rope', category: 'tools' })).toMatch(/images\/items\/rope\.png$/);
  });
});
