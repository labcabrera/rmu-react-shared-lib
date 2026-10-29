/** Side of a deal. */
export type TradingContext = 'purchase' | 'sale';

/** One row of the negotiation table: percent of the expected price for a range of the total (spec 048). */
export type NegotiationRow = {
  min: number | null;
  max: number | null;
  purchase: number | null;
  sale: number | null;
  outcome?: 'no-agreement' | 'absolute-failure' | 'special-offer';
};

/** A market condition of the expected price: a choice, a flag or a number of units; a multiplier or percent points. */
export type PriceFactor = {
  key: string;
  type: 'choice' | 'flag' | 'number';
  mode: 'multiplier' | 'percent';
  value?: number;
  options?: { key: string; value: number }[];
  perUnit?: number;
  min?: number;
  max?: number;
  /** Sides it applies to; every one when missing. */
  contexts?: TradingContext[];
  description?: string;
};

/** Trading tables of rmu-api-core, imported from the rulebook data (spec 048). */
export type TradingTables = { negotiation: NegotiationRow[]; priceFactors: PriceFactor[] };
