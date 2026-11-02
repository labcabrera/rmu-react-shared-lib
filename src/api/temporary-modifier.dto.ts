// Lasting modifiers of morale and fear (workspace spec 068, decision 19), shared by rmu-api-tactical (actor rounds and
// the outcome of a game) and rmu-api-strategic (the character, where they expire with the campaign calendar).

export type TemporaryModifierKind = 'morale' | 'fear-rr';

export type TemporaryModifierSource =
  | 'morale-absolute-success'
  | 'morale-absolute-failure'
  | 'rally-unusual'
  | 'manual';

export const TEMPORARY_MODIFIER_KINDS: TemporaryModifierKind[] = ['morale', 'fear-rr'];

export const TEMPORARY_MODIFIER_SOURCES: TemporaryModifierSource[] = [
  'morale-absolute-success',
  'morale-absolute-failure',
  'rally-unusual',
  'manual',
];

/** A modifier as tactical creates it: added to later morale checks (`morale`) or fear RRs (`fear-rr`). */
export interface TemporaryModifier {
  id: string;
  kind: TemporaryModifierKind;
  value: number;
  source: TemporaryModifierSource;
  /** Days of campaign it lasts; null: until the game master removes it. */
  days: number | null;
  createdAt: string;
  /** The game that created it; null for one brought from the character. */
  tacticalGameId: string | null;
  /** Strategic: first day of the campaign it no longer applies; null until removed. */
  expiresGameDay?: number | null;
}

/** A modifier on a strategic character (`Character.temporaryModifiers`). */
export interface CharacterTemporaryModifier extends TemporaryModifier {
  expiresGameDay: number | null;
}

/** Units of a strategic item spent in a tactical game (workspace spec 068, decision 7). */
export interface ItemConsumed {
  itemId: string;
  amount: number;
}

/**
 * Days a strategic modifier still applies on `currentDay` (0 or less once expired), or null when it has no expiry day
 * (it lasts until removed, or it is a tactical one) or the current day is unknown.
 */
export const temporaryModifierDaysLeft = (modifier: TemporaryModifier, currentDay?: number | null): number | null => {
  const expires = modifier.expiresGameDay;
  if (expires === undefined || expires === null || currentDay === undefined || currentDay === null) return null;
  return expires - currentDay;
};
