import type { ItemHolder } from './strategic-item.dto';

// Magic items of Treasure Law (workspace spec 067): the `features.magic` block of the catalog of rmu-api-items and
// the requests of the magic item, charge, gem cut and gem setting endpoints of rmu-api-strategic.

/** Kinds of magic item (Treasure Law 3.3 and chapter 6); labels `magic-kind-<kind>`. */
export const MAGIC_ITEM_KINDS = [
  'daily',
  'constant',
  'at-will',
  'triggered',
  'emplaced',
  'charged',
  'single-use',
  'potion',
  'rune-paper',
  'power-enhancer',
  'general-bonus',
  'stat-bonus',
  'skill',
  'armor',
  'weapon',
  'other',
] as const;
export type MagicItemKind = (typeof MAGIC_ITEM_KINDS)[number];

/** Structured bonuses of a magic item; labels `magic-bonus-<kind>`. */
export const MAGIC_BONUS_KINDS = [
  'ob',
  'db',
  'shield',
  'skill',
  'rr',
  'stat',
  'spell-adder',
  'pp-multiplier',
  'pp-adder',
  'armor-penalty',
] as const;
export type MagicBonusKind = (typeof MAGIC_BONUS_KINDS)[number];

/** How an item uses a spell: the recipe of its enchantment, or how it casts it; labels `magic-spell-use-<use>`. */
export const MAGIC_SPELL_USES = [
  'recipe',
  'constant',
  'daily',
  'charges',
  'at-will',
  'triggered',
  'emplaced',
  'single-use',
] as const;
export type MagicSpellUse = (typeof MAGIC_SPELL_USES)[number];

/** Realms of a magic item. */
export const MAGIC_ITEM_REALMS = ['channeling', 'essence', 'mentalism', 'hybrid'] as const;

/** A bonus of a magic item; `against` is a creature type (own kebab key) it only applies against. */
export type MagicItemBonus = { kind: MagicBonusKind; value: number; target?: string | null; against?: string | null };

/** A spell of a magic item; `perDay` for the daily ones. */
export type MagicItemSpell = {
  name: string;
  level: number;
  list?: string | null;
  use: MagicSpellUse;
  perDay?: number | null;
};

/** `features.magic` of a catalog item (spec 067, decision 4). Prices in gold. */
export type MagicItemFeature = {
  itemLevel: number;
  kind: MagicItemKind;
  /** Working days of the recipe. */
  days: number | null;
  /** Price at the Superior power level, base item included. */
  standardPrice: number | null;
  /** The base item part of `standardPrice`. */
  basePrice: number | null;
  attunement: boolean;
  /** Max charges. */
  charges: number | null;
  /** `channeling`, `essence`, `mentalism`, `hybrid` or null. */
  realm: string | null;
  bonuses: MagicItemBonus[];
  spells: MagicItemSpell[];
  /** Book section, such as `6.5`. */
  section: string | null;
};

/** Standard upgrade tables of chapter 6 a magic item request may be priced with. */
export const MAGIC_STANDARD_TABLES = ['weapon', 'ranged', 'armor', 'shield', 'general-bonus'] as const;
export type MagicStandardTable = (typeof MAGIC_STANDARD_TABLES)[number];

/** Materials of the general bonus table (6-1e). */
export const MAGIC_STANDARD_MATERIALS = ['wood', 'metal', 'leather'] as const;

/** Body of `POST v1/items/magic/quote`: a base item of the catalog with bonuses and spells. Prices in gold. */
export type MagicItemRequest = {
  baseItemTypeId: string;
  name?: string | null;
  kind: MagicItemKind;
  itemLevel?: number | null;
  bonuses: MagicItemBonus[];
  spells: MagicItemSpell[];
  charges?: number | null;
  attunement?: boolean;
  /** Price set by hand; null quotes it. */
  price?: number | null;
  standard?: { table: MagicStandardTable; bonus: number; material?: string } | null;
};

/** The quote of a magic item; price in gold, `breakdown` lines are i18n keys or plain text of the server. */
export type MagicItemQuote = { days: number; itemLevel: number; price: number; breakdown: string[] };

/** Body of `POST v1/items/magic`: the request, the game and the holder, and who pays (`none` is a gift). */
export type CreateMagicItemDto = MagicItemRequest & {
  gameId: string;
  factionId?: string | null;
  characterId?: string | null;
  payer?: 'none' | ItemHolder;
};

/** Charges of an item instance. */
export type ItemCharges = { max: number; current: number };

/** Body of `POST v1/items/:id/charges`: a delta (negative spends) or a recharge, charged to the holder. */
export type ChangeChargesDto = { delta: number } | { recharge: true };

/** Modern cut factors (Treasure Law 2.4 optional rule) of `POST v1/items/:id/cut`. */
export const GEM_MODERN_CUT_FACTORS = [5, 10] as const;
export type GemCutFactor = (typeof GEM_MODERN_CUT_FACTORS)[number];

/** The magic traits of a gem (Treasure Law table 2-4f). */
export type GemMagic = { spells?: string | null; stats?: string[]; skills?: string | null; other?: string | null };

/** A gem set in an item (`StrategicItem.settings`): a copy of the gem item. Value in gold. */
export type ItemGemSetting = {
  itemTypeId: string;
  name: string;
  carats: number | null;
  cutFactor: number | null;
  value: number;
  magic: GemMagic | null;
  setAt: string;
};

/** The signed text of a bonus value: `+10`, `-5`, `×2` for a power point multiplier. */
export const magicBonusValue = (bonus: { kind: string; value: number }): string => {
  if (bonus.kind === 'pp-multiplier') return `×${bonus.value}`;
  return bonus.value >= 0 ? `+${bonus.value}` : `${bonus.value}`;
};
