/** Coins of Core Law table 6-0a, from the most valuable: each one is worth ten of the next. */
export type Coin = 'gp' | 'sp' | 'bp' | 'cp';
export const COINS: Coin[] = ['gp', 'sp', 'bp', 'cp'];

export type CoinAmount = { coin: Coin; amount: number };

/** Gold kept with three decimals: a copper piece is 0.001 gp. */
export const roundGold = (gold: number): number => Math.round(gold * 1000) / 1000;

/**
 * Gold as coins (spec 023, decision 7): 12.345 gp is 12 gp, 3 sp, 4 bp and 5 cp. Coins without units are left out,
 * and no gold at all is 0 gp. A negative amount keeps its sign on every coin.
 */
export const toCoins = (gold: number): CoinAmount[] => {
  const sign = gold < 0 ? -1 : 1;
  let copper = Math.round(Math.abs(gold) * 1000);
  const parts: CoinAmount[] = [];
  [1000, 100, 10, 1].forEach((size, index) => {
    const amount = Math.floor(copper / size);
    copper -= amount * size;
    if (amount > 0) parts.push({ coin: COINS[index], amount: sign * amount });
  });
  return parts.length > 0 ? parts : [{ coin: 'gp', amount: 0 }];
};

/** Plain text of an amount of gold, with the coin abbreviations given (translated by the caller). */
export const formatMoney = (
  gold: number,
  labels: Record<Coin, string> = { gp: 'gp', sp: 'sp', bp: 'bp', cp: 'cp' }
): string =>
  toCoins(gold)
    .map((part) => `${part.amount} ${labels[part.coin]}`)
    .join(' ');
