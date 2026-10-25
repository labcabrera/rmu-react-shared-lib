/** Kind of modifier of an item (spec 019): breakage damage, quality or material, or anything else of the game master. */
export type StrategicItemModifierType = 'breakage' | 'quality' | 'custom';
export const STRATEGIC_ITEM_MODIFIER_TYPES: StrategicItemModifierType[] = ['breakage', 'quality', 'custom'];

/** Uses of the item a modifier applies to: every use, only its breakage checks, or one kind of use. */
export type StrategicItemModifierTarget = 'all' | 'breakage' | 'attack' | 'defense' | 'maneuver';
export const STRATEGIC_ITEM_MODIFIER_TARGETS: StrategicItemModifierTarget[] = [
  'all',
  'breakage',
  'attack',
  'defense',
  'maneuver',
];

/** Where a modifier comes from; spec 023 adds the crafting and repair of the item and its catalog type. */
export type StrategicItemModifierSourceKind = 'tactical' | 'manual' | 'crafting' | 'repair' | 'catalog';

export type StrategicItemModifierSource = {
  kind: StrategicItemModifierSourceKind;
  tacticalGameId?: string;
  tacticalGameName?: string;
  round?: number;
  actionId?: string;
  /** Spec 023: the ledger entry of the operation that made it. */
  ledgerEntryId?: string;
};

/** A modifier of an item: the same uuid in the tactical game and in the strategic item once applied. */
export type StrategicItemModifier = {
  id: string;
  type: StrategicItemModifierType;
  value: number;
  appliesTo: StrategicItemModifierTarget;
  /** Breakage only: the item is broken. */
  broken?: boolean;
  /** Only in tactical games: damage that does not last after the game. */
  temporary?: boolean;
  source?: StrategicItemModifierSource;
  description?: string;
  createdAt: string;
};

/** Breakage state of an item, derived from its modifiers. */
export type ItemCondition = {
  /** Sum of the breakage modifiers, 0 or negative. */
  breakagePenalty: number;
  broken: boolean;
  /** Spec 023: an absolute failure repairing it when broken. */
  unrepairable?: boolean;
};

/** Body of `POST /items/:id/modifiers`. */
export type AddStrategicItemModifierDto = {
  type: StrategicItemModifierType;
  value: number;
  appliesTo: StrategicItemModifierTarget;
  broken?: boolean;
  description?: string;
};

/** The condition of a list of modifiers, as the APIs derive it. */
export const itemCondition = (modifiers: StrategicItemModifier[] | undefined): ItemCondition => {
  const breakage = (modifiers || []).filter((modifier) => modifier.type === 'breakage');
  const sum = breakage.reduce((total, modifier) => total + (modifier.value || 0), 0);
  return { breakagePenalty: Math.min(0, sum), broken: breakage.some((modifier) => !!modifier.broken) };
};
