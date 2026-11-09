import type { MagicItemBonus, MagicItemKind, MagicSpellUse } from './magic-item.dto';

// The random treasure, random gem and standard price tables of Treasure Law (workspace spec 067), the
// `treasure-tables` document of rmu-api-core. Prices of the book tables in silver (sp).

/** A row of a table for a roll; inclusive, d100 or 1-300. */
export type TreasureRangeRow = { min: number; max: number };

/** Quality of a treasure code (table 7-1a); labels `treasure-quality-<quality>`. */
export const TREASURE_QUALITIES = ['very-poor', 'poor', 'normal', 'rich', 'very-rich'] as const;
export type TreasureQuality = (typeof TREASURE_QUALITIES)[number];

/** The magic tables of 7-1h. */
export const TREASURE_MAGIC_TABLES = ['melee', 'ranged', 'armor', 'utility', 'spell', 'charged'] as const;
export type TreasureMagicTable = (typeof TREASURE_MAGIC_TABLES)[number];

export type TreasureWealthType = 'coins' | 'gems' | 'jewelry' | 'art';

/** A magic item of a table that the generator builds from a base item. */
export type GenericMagicItem = {
  base: 'weapon' | 'missile' | 'ranged' | 'armor' | 'shield' | 'jewelry' | 'potion' | 'spell-item' | 'other';
  /** A fixed base, such as a wand. */
  baseItemTypeId?: string | null;
  kind: MagicItemKind;
  itemLevel?: number | null;
  /** `against: 'random'` rolls 7-1k. */
  bonuses: MagicItemBonus[];
  spell?: {
    levelMin: number;
    levelMax: number;
    use: MagicSpellUse;
    perDay?: number | null;
    charges?: number | null;
  } | null;
};

/** A row of the magic tables 7-1i, l, m, o, p and q (1-300). */
export type TreasureMagicTableRow = TreasureRangeRow & {
  /** Book row text, data only. */
  label: string;
  /** sp. */
  price: { min: number; max: number };
  /** A named compendium item. */
  itemTypeId?: string | null;
  generic?: GenericMagicItem | null;
};

/** Tables 2-4d and 2-4e: one column per value range, with the gems of each roll. */
export type GemRandomTable = {
  columns: { min: number; max: number; rows: (TreasureRangeRow & { itemTypeId: string })[] }[];
};

export type StandardBonusRow = { bonus: number; days: number; level: number; price: number };
export type StandardPriceRow = { days: number; level: number; price: number };
export type StandardRealmColumn = 'essence' | 'channeling-mentalism' | 'hybrid';

/** The standard price tables of chapter 6 (prices in sp). */
export type StandardPricing = {
  /** 6-1a: price per day = item level + extraSp. */
  pricePerDay: { ppMin: number; ppMax: number | null; extraSp: number }[];
  weapon: StandardBonusRow[];
  ranged: StandardBonusRow[];
  armor: { at: number; rows: StandardBonusRow[] }[];
  shield: StandardBonusRow[];
  generalBonus: { material: 'wood' | 'metal' | 'leather'; rows: StandardBonusRow[] }[];
  powerEnhancers: { effect: string; held: StandardPriceRow; worn: StandardPriceRow }[];
  daily: { spellLevel: number; realm: StandardRealmColumn; row: StandardPriceRow }[];
  constant: { spellLevel: number; realm: StandardRealmColumn; row: StandardPriceRow }[];
  emplaced: { spellLevel: number; row: StandardPriceRow & { itemPp: number } }[];
  potions: { spellLevel: number; row: StandardPriceRow }[];
  charged: {
    stick: 'wand' | 'rod' | 'staff' | 'half-bole' | 'bole';
    spellLevel: number;
    charges: number;
    row: StandardPriceRow;
  }[];
};

/** `GET v1/treasure-tables` of rmu-api-items (Treasure Law access). */
export type TreasureTablesDto = {
  id: 'treasure';
  /** 7-1a: a..e, l..p, u..z. */
  codes: {
    wealth: Record<string, TreasureQuality>;
    lifestyle: Record<string, TreasureQuality>;
    magic: Record<string, TreasureQuality>;
  };
  /** 7-1b. */
  wealthRolls: (TreasureRangeRow & { rolls: number })[];
  /** 7-1c value; min may be -999 ("0 or less") and max 999 ("201+"). */
  wealthValue: (TreasureRangeRow & { valueMin: number; valueMax: number })[];
  /** 7-1c modifiers, own keys. */
  wealthValueModifiers: { key: string; value: number }[];
  wealthType: (TreasureRangeRow & { type: TreasureWealthType; multiplier: number })[];
  wealthMultipliers: Record<TreasureQuality, number>;
  /** 7-1d, jewelry catalog ids. */
  jewelryTypes: (TreasureRangeRow & { itemTypeId: string })[];
  /** 7-1e, own kebab keys. */
  artTypes: (TreasureRangeRow & { key: string })[];
  /** 7-1f. */
  gearQuality: (TreasureRangeRow & Record<TreasureQuality, { total: number; max: number | null }>)[];
  /** 7-1g: modifiers per quality ([] = none). */
  magicTreasure: (TreasureRangeRow & Record<TreasureQuality, number[]>)[];
  magicMaxLevel: Record<TreasureQuality, number | null>;
  /** 7-1h. */
  itemType: (TreasureRangeRow & { table: TreasureMagicTable })[];
  magicTables: Record<TreasureMagicTable, TreasureMagicTableRow[]>;
  /** 7-1j. */
  randomWeapons: {
    table: (TreasureRangeRow & { group: string })[];
    size: (TreasureRangeRow & { size: string })[];
    groups: Record<string, (TreasureRangeRow & { itemTypeId: string | null; missile?: boolean })[]>;
  };
  /** 7-1k, own kebab keys. */
  creatureTypes: (TreasureRangeRow & { key: string })[];
  /** 7-1n. */
  randomArmor: (TreasureRangeRow & { itemTypeId: string | null; at: number | null; shield?: boolean })[];
  /** 7-1r: listCode of rmu-api-spells; null is "other". */
  randomSpells: {
    realm: (TreasureRangeRow & { realm: string })[];
    lists: Record<string, (TreasureRangeRow & { listCode: string | null })[]>;
  };
  /** 2-4d, 2-4e. */
  gems: { precious: GemRandomTable; semiPrecious: GemRandomTable };
  standardPricing: StandardPricing;
  version: number;
};
