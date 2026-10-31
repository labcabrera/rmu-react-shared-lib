import React from 'react';
import type { AuthContextProps } from 'react-oidc-context';
import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Item, ItemFeatures } from '../../api/item.dto';
import type { StrategicItem } from '../../api/strategic-item.dto';
import { applyActorHerb, applyCharacterHerb, fetchTaxation, searchCharacterHerbs } from '../../api/treasure-goods.api';
import { herbTreats, isHealingHerb, ItemHerb } from '../../api/treasure-goods.dto';
import { renderWithProviders } from '../../test/render';
import { itemFeatureLines } from './ItemFeatureChips';
import ItemFeaturesView, { itemFeatureSections } from './ItemFeaturesView';
import { itemInstanceLabels } from './ItemInventory';
import { itemCatalogFilters } from './item-catalog';

// Synthetic fixtures (spec 062): never rows of the book. Without an i18n instance the labels are the keys.
const t = (key: string, options?: object) => (options ? `${key} ${JSON.stringify(options)}` : key);

const herb: ItemHerb = {
  group: 'minor-healing',
  biomes: ['F', 'B'],
  highAltitude: false,
  find: 'h',
  form: 'leaf',
  prep: 'ingest',
  season: 'spring',
  effectDelay: 'immediate',
  magical: true,
  addictionFactor: null,
  effects: { heal: { min: 2, max: 20 }, stunRelief: null, treats: ['bone'], recoveryBonus: null },
};

const features: ItemFeatures = {
  herb,
  gem: {
    grade: 'semi-precious',
    mineral: 'test-stone',
    valuePerCarat: 0.5,
    hardness: { min: 6, max: 7 },
    specificGravity: null,
    luster: 'V',
    caratsPerCm: null,
    magic: null,
  },
  acid: {
    strength: 'mild',
    splash: { severity: 'A', modifier: -50 },
    immersion: { severity: 'B', count: 2, everyRounds: 1 },
    ingestion: null,
    breakageMod: -10,
    craftDifficulty: 'm',
    targets: 'any',
  },
  jewelry: { value: { min: 1, max: 100, dice: 'd100', openEnded: true }, slot: 'finger' },
  animal: { npcId: null, trained: false, stage: 'young', domesticated: true },
  property: { rent: 12, size: null, height: null },
  intoxicant: { addictionFactor: 5, form: null, prep: null },
};

const catalogItem = (id: string, category: string, extra: ItemFeatures | null): Item =>
  ({ id, name: id, category, features: extra, info: { rarity: 'common' } }) as unknown as Item;

describe('Treasure Law blocks (spec 062)', () => {
  it('gives a panel to each block', () => {
    expect(itemFeatureSections(features, t).map((section) => section.key)).toEqual([
      'herb',
      'acid',
      'intoxicant',
      'gem',
      'jewelry',
      'animal',
      'property',
    ]);
    expect(itemFeatureSections(null, t)).toEqual([]);
    const herbRows = itemFeatureSections({ herb }, t)[0].rows;
    expect(herbRows.find((row) => row.label === 'herb-heal')?.value).toBe('2-20');
    expect(herbRows.find((row) => row.label === 'herb-treats')?.value).toBe('injury-type-bone');
  });

  it('shows the chips of the blocks', () => {
    const keys = itemFeatureLines({ features }, t).map((line) => line.key);
    expect(keys).toEqual(
      expect.arrayContaining(['herb-group', 'herb-biomes', 'herb-heal', 'acid', 'gem-grade', 'jewelry-slot', 'rent'])
    );
  });

  it('renders the panels', () => {
    renderWithProviders(<ItemFeaturesView features={{ herb }} />);
    expect(screen.getByText('item-category-herb')).toBeInTheDocument();
    expect(screen.getByText('herb-group-minor-healing')).toBeInTheDocument();
  });

  it('labels the size, carats, cut and class of an owned item', () => {
    expect(
      itemInstanceLabels({ size: 'big', carats: 5, cutFactor: 5, jewelryClass: 'fine' }, t).map((l) => l.key)
    ).toEqual(['size', 'carats', 'cut', 'class']);
    expect(itemInstanceLabels({ size: 'medium', cutFactor: 1 }, t)).toEqual([]);
  });

  it('tells the herbs that heal and the injuries a herb treats', () => {
    const owned = { category: 'herb', catalog: { features: { herb } } } as unknown as StrategicItem;
    expect(isHealingHerb(owned)).toBe(true);
    expect(isHealingHerb({ ...owned, category: 'other' })).toBe(false);
    expect(herbTreats(herb, 'bone')).toBe(true);
    expect(herbTreats(herb, 'organ')).toBe(false);
    expect(herbTreats({ ...herb, effects: { ...herb.effects!, treats: ['any'] } }, 'organ')).toBe(true);
    expect(herbTreats(null, 'bone')).toBe(false);
  });

  it('filters herbs by group and biome and gems by grade', () => {
    const schema = itemCatalogFilters(t);
    const forest = catalogItem('h1', 'herb', { herb });
    const desert = catalogItem('h2', 'herb', { herb: { ...herb, group: 'stun', biomes: ['D'] } });
    const gem = catalogItem('g1', 'gem', { gem: features.gem });
    expect(schema.herbGroup.match!(forest, ['minor-healing'])).toBe(true);
    expect(schema.herbGroup.match!(desert, ['minor-healing'])).toBe(false);
    expect(schema.biome.match!(forest, ['B'])).toBe(true);
    expect(schema.biome.match!(desert, ['B', 'F'])).toBe(false);
    expect(schema.gemGrade.match!(gem, 'semi-precious')).toBe(true);
    expect(schema.gemGrade.match!(gem, 'precious')).toBe(false);
  });
});

describe('treasure goods api (spec 062)', () => {
  const auth = { isAuthenticated: true, user: { access_token: 'token' } } as unknown as AuthContextProps;
  const mockFetch = (body: unknown = {}) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(body), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };
  const call = (fetchMock: ReturnType<typeof vi.fn>) => {
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    return { url: String(url), method: init.method, body: init.body ? JSON.parse(String(init.body)) : undefined };
  };

  afterEach(() => vi.unstubAllGlobals());

  it('uses a herb of a character', async () => {
    const fetchMock = mockFetch();
    await applyCharacterHerb('c1', { itemId: 'i1', roll: 7 }, auth);
    expect(call(fetchMock)).toMatchObject({ method: 'POST', body: { itemId: 'i1', roll: 7 } });
    expect(call(fetchMock).url).toMatch(/\/characters\/c1\/herb-uses$/);
  });

  it('searches for herbs', async () => {
    const fetchMock = mockFetch();
    await searchCharacterHerbs(
      'c1',
      {
        biome: 'F',
        highAltitude: false,
        herbItemTypeIds: ['h1'],
        skillId: 'perception',
        roll: 80,
        previousSearches: 0,
        familiar: false,
      },
      auth
    );
    expect(call(fetchMock).url).toMatch(/\/characters\/c1\/herb-searches$/);
    expect(call(fetchMock).body.herbItemTypeIds).toEqual(['h1']);
  });

  it('uses a herb in combat', async () => {
    const fetchMock = mockFetch();
    await applyActorHerb('ar1', { itemId: 'i1' }, auth);
    expect(call(fetchMock).url).toMatch(/\/actor-rounds\/ar1\/herbs$/);
  });

  it('reads the taxes of the trading tables', async () => {
    mockFetch({ negotiation: [], priceFactors: [], taxation: [{ key: 'toll', cost: 0.1, unit: 'person' }] });
    expect(await fetchTaxation(auth)).toEqual([{ key: 'toll', cost: 0.1, unit: 'person' }]);
    mockFetch({ negotiation: [], priceFactors: [] });
    expect(await fetchTaxation(auth)).toEqual([]);
  });
});
