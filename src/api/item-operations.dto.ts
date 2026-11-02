import { CraftingQualityDto } from './crafting.dto';
import { ItemHolder, StrategicItem } from './strategic-item.dto';
import type { ItemInstanceSpec, PurchaseItemOptions } from './treasure-goods.dto';

/**
 * Operations of the item ledger (spec 023); `import` (spec 024), `found`, the doses of a herb search (spec 062), and
 * the treasure, magic item, recharge and gem operations of workspace spec 067; `consumed` (workspace spec 068).
 */
export type ItemLedgerKind =
  | 'purchase'
  | 'sale'
  | 'transfer'
  | 'craft'
  | 'repair'
  | 'discard'
  | 'gold-transfer'
  | 'import'
  | 'found'
  | 'enchant'
  | 'enchant-refund'
  | 'treasure'
  | 'magic-item'
  | 'recharge'
  | 'gem-cut'
  | 'gem-set'
  | 'gem-unset'
  /** Workspace spec 068: units spent in a tactical game. */
  | 'consumed';

/** Who pays a purchase of a character: its coins, its faction, or its coins and then the faction. */
export type PayerMode = 'holder' | 'faction' | 'split';

export type RollModifier = { key: string; value: number };

/** A Trading maneuver of a purchase or a sale: the roll of the active side. */
export type TradingRequest = {
  roll: number;
  unmodifiedRoll?: number;
  /** By default the Trading bonus of the character sheet. */
  bonus?: number;
  /** The merchant (100 less its total), reputation, language... */
  modifiers?: RollModifier[];
};

/**
 * Result of a Trading maneuver (spec 048). `treasure-law`: the negotiation table gives the percent of the expected
 * price; a null `pricePercent` means there is no deal. `core-law`: 200% less the percent maneuver result.
 */
export type TradingResult = {
  total: number;
  maneuverPercent?: number;
  pricePercent: number | null;
  table?: 'treasure-law' | 'core-law';
  outcome?: 'no-agreement' | 'absolute-failure' | 'special-offer';
};

/** A market condition of the expected price chosen in a purchase or a sale (spec 048). */
export type PriceFactorSelection = { key: string; option?: string; units?: number };

/** A market condition as applied: a multiplier, or percent points added to the factor. */
export type PriceFactorItem = PriceFactorSelection & { mode: 'multiplier' | 'percent'; value: number };

/** The factor of the expected price and the conditions that make it. */
export type PriceFactors = { value: number; items: PriceFactorItem[] };

/** How a price was worked out. */
export type PriceBreakdown = {
  kind: 'purchase' | 'sale';
  unitBase: number;
  amount: number;
  salePercent?: number;
  conditionPercent?: number;
  condition?: 'intact' | 'damaged' | 'broken';
  /** Market conditions (spec 048) */
  factor?: PriceFactors;
  /** Base times the factor, before the negotiation */
  expectedUnitPrice?: number;
  trading?: TradingResult;
  /** Spec 062: commission of the jeweler that bought it. */
  jewelerPercent?: number;
  unitPrice: number;
  total: number;
};

export type EconomyRules = {
  salePercent: number;
  materialsPercent: number;
  conditionPercent: { intact: number; damaged: number; broken: number };
  /** Spec 062: commission of a jeweler buying gems and jewelry (`RMU_STRATEGIC_JEWELER_PERCENT`, 3). */
  jewelerPercent?: number;
};

export type PriceQuote = { price: PriceBreakdown; rules: EconomyRules };

/** Gold of one holder in an operation: negative paid, positive received. */
export type LedgerPayment = { holder: ItemHolder; gold: number };

export type LedgerManeuver = {
  skillId?: string;
  roll: number;
  unmodifiedRoll?: number;
  bonus: number;
  modifiers: RollModifier[];
  total: number;
  result?: string;
  percent?: number;
  unusualEvent?: boolean;
};

export type ItemLedgerEntry = {
  id: string;
  gameId: string;
  kind: ItemLedgerKind;
  itemId: string | null;
  /** Spec 041: every item of the operation; filter the history of an item with `itemIds==<id>`. */
  itemIds?: string[];
  itemTypeId: string | null;
  itemName: string | null;
  amount: number | null;
  from: ItemHolder | null;
  to: ItemHolder | null;
  holderIds: string[];
  payments: LedgerPayment[];
  price: PriceBreakdown | null;
  maneuver: LedgerManeuver | null;
  /** Character who crafted or repaired. */
  actorId: string | null;
  /** Outcome key of a craft or repair. */
  outcome: string | null;
  note: string | null;
  /** Data of the operation: the file of an import (spec 024), the crafting plan of a craft (spec 043). */
  details?: Record<string, unknown> | null;
  userId: string;
  createdAt: string;
};

/** What an operation answers: the item as it is now (null when it is gone) and its ledger entry. */
export type ItemOperationResult = {
  item: StrategicItem | null;
  /** Spec 041: the N items of a purchase of a type that does not stack. */
  items?: StrategicItem[];
  entry: ItemLedgerEntry;
};

/** Spec 062 adds the size, carats and cut, jewelry class and base value of `PurchaseItemOptions`. */
export type PurchaseItemDto = PurchaseItemOptions & {
  buyer: ItemHolder;
  itemTypeId: string;
  gameId?: string;
  amount?: number;
  unitPrice?: number;
  payer?: PayerMode;
  trading?: TradingRequest;
  name?: string;
  description?: string;
  wielderSize?: string;
  carried?: boolean;
};

export type SellItemDto = {
  amount?: number;
  unitPrice?: number;
  salePercent?: number;
  factors?: PriceFactorSelection[];
  trading?: TradingRequest;
  /** Spec 062: a gem or a jewel sold to a jeweler, for its value less the commission and without a Trading roll. */
  jeweler?: boolean;
  /** 0-100; the economy rules give the default. */
  jewelerPercent?: number;
};

/** Spec 062 adds the instance data of each line (`PurchaseItemOptions`). */
export type PurchaseOrderLine = PurchaseItemOptions & { itemTypeId: string; amount: number };

/** Several item types bought at once with the same market conditions and Trading (spec 048). */
export type PurchaseOrderDto = {
  buyer: ItemHolder;
  gameId?: string;
  payer?: PayerMode;
  lines: PurchaseOrderLine[];
  factors?: PriceFactorSelection[];
  trading?: TradingRequest;
};

export type QuotePurchaseOrderDto = Omit<PurchaseOrderDto, 'buyer' | 'gameId' | 'payer'> & { buyer?: ItemHolder };

export type PurchaseOrderQuote = {
  /** `instance`: the instance fields with their defaults (spec 062). */
  lines: { itemTypeId: string; amount: number; instance?: ItemInstanceSpec; price: PriceBreakdown }[];
  factor?: PriceFactors;
  /** A null `pricePercent` means there is no deal: buying fails. */
  trading?: TradingResult;
  total: number;
};

export type PurchaseOrderResult = { items: StrategicItem[]; entries: ItemLedgerEntry[] };

export type TransferItemDto = { to: ItemHolder; amount?: number };

export type DiscardItemDto = { amount?: number; note?: string };

/** A crafting or repair maneuver. */
export type ItemManeuverDto = {
  actorId?: string;
  skillId?: string;
  specialization?: string;
  bonus?: number;
  difficulty?: string;
  modifiers?: RollModifier[];
  roll: number;
  unmodifiedRoll?: number;
};

export type CraftingEnhancement = { appliesTo: string; value: number; description?: string };

export type CraftItemDto = {
  itemTypeId: string;
  maneuver: ItemManeuverDto & { actorId: string };
  to?: ItemHolder;
  payer?: ItemHolder;
  free?: boolean;
  amount?: number;
  materialsCost?: number;
  enhancements?: CraftingEnhancement[];
  enhancementsCost?: number;
  name?: string;
  description?: string;
  wielderSize?: string;
  /** Spec 043: material, masterwork, armor weight and workshop. */
  quality?: CraftingQualityDto;
};

export type RepairItemDto = { maneuver: ItemManeuverDto; cost?: number; payer?: ItemHolder };

export type QuotePriceDto = {
  kind: 'purchase' | 'sale';
  itemTypeId?: string;
  itemId?: string;
  holder?: ItemHolder;
  amount?: number;
  unitPrice?: number;
  salePercent?: number;
  factors?: PriceFactorSelection[];
  trading?: TradingRequest;
  /** Spec 062: the quote of a sale to a jeweler. */
  jeweler?: boolean;
  jewelerPercent?: number;
} & PurchaseItemOptions;
