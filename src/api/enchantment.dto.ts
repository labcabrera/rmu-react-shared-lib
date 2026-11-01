import type { ItemHolder, StrategicItem } from './strategic-item.dto';

// Alchemy and enchantment of items (workspace spec 064): the alchemy tables of rmu-api-core, the alchemy data of a
// spell of rmu-api-spells and the enchantment projects of rmu-api-strategic.

/** The ten alchemy failure tables (Treasure Law 7.3), one per kind of enchantment. */
export const ALCHEMY_FAILURE_TABLES = [
  'bonus',
  'embedded-entity',
  'general',
  'independent-entity',
  'intelligence',
  'location',
  'organism',
  'potion',
  'power-enhancer',
  'spell-power',
] as const;
export type AlchemyFailureTable = (typeof ALCHEMY_FAILURE_TABLES)[number];

/** Power levels of a campaign: they multiply the cost of an enchantment, not the base item. */
export const POWER_LEVELS = ['average', 'superior', 'heroic', 'legendary', 'epic'] as const;
export type PowerLevel = (typeof POWER_LEVELS)[number];
export const DEFAULT_POWER_LEVEL: PowerLevel = 'superior';

export type SpellAlchemyEffectKind = 'attack' | 'defense' | 'skill' | 'spell-adder' | 'pp-multiplier';
export const SPELL_ALCHEMY_EFFECT_KINDS: SpellAlchemyEffectKind[] = [
  'attack',
  'defense',
  'skill',
  'spell-adder',
  'pp-multiplier',
];

/** What an enchantment spell gives the item: an OB or DB bonus, a skill bonus, a spell adder or a PP multiplier. */
export type SpellAlchemyEffect = { kind: SpellAlchemyEffectKind; value: number };

/** Alchemy data of an alchemical spell (`Spell.alchemy`). */
export type SpellAlchemy = {
  failureTable: AlchemyFailureTable;
  /** Cast once per unit in a batch (Work…, Make…). */
  perItem: boolean;
  /** Book mark `#`: it creates or alters the base item. */
  alters: boolean;
  effect: SpellAlchemyEffect | null;
};

/** A row of an alchemy failure table; `max` null is open ("301+"). */
export type AlchemyFailureRow = { min: number; max: number | null; text: string; serendipity?: 'minor' | 'major' };

/** GET /v1/alchemy-tables of rmu-api-core. */
export type AlchemyTables = {
  id: 'alchemy';
  failureTables: Record<AlchemyFailureTable, AlchemyFailureRow[]>;
  powerLevels: Record<PowerLevel, number>;
  version: number;
};

// Enchantment projects -------------------------------------------------------------------------------------------

export type EnchantmentScope = 'normal' | 'doubled' | 'halved';
export const ENCHANTMENT_SCOPES: EnchantmentScope[] = ['normal', 'doubled', 'halved'];

export type EnchantmentSpellRequest = {
  spellId: string;
  scope?: EnchantmentScope;
  /** The skill of a skill bonus. */
  target?: string | null;
};

/** Body of POST /v1/enchantments/quote. */
export type EnchantmentRequest = {
  alchemistId: string;
  itemId: string;
  spells: EnchantmentSpellRequest[];
  /** Default 1; more only for a stack of that amount. */
  batchSize?: number;
  /** Default `superior`. */
  powerLevel?: PowerLevel;
};

/** Body of POST /v1/enchantments: the request, one open-ended SCR roll per spell and who pays the materials. */
export type CreateEnchantmentDto = EnchantmentRequest & {
  scrRolls: Record<string, number>;
  payer?: ItemHolder | null;
};

export type EnchantmentPlanSpell = {
  spellId: string;
  name: string;
  level: number;
  listId: string;
  listCode: string;
  listSkillId: string;
  type: string | null;
  scope: EnchantmentScope;
  days: number;
  pp: number;
  casts: number;
  perItem: boolean;
  failureTable: AlchemyFailureTable;
  effect: { kind: string; value: number } | null;
  target: string | null;
  scrModifiers: { key: string; value: number }[];
  scrBonus: number;
};

/** The quote of an enchantment. Costs in gold. */
export type EnchantmentPlan = {
  spells: EnchantmentPlanSpell[];
  batchSize: number;
  powerLevel: PowerLevel;
  powerMultiplier: number;
  baseDays: number;
  materialBonusReduction: number;
  workingDays: number;
  ppPerDay: number;
  itemLevel: number;
  materialCost: number;
  laborCost: number;
  enchantmentCost: number;
  paidAtStart: number;
  marketValue: number;
  maxAlchemists: number;
  /** Keys such as `pp-per-day-above-character-pp`. */
  warnings: string[];
};

export type EnchantmentFailure = {
  table: AlchemyFailureTable;
  min: number;
  max: number | null;
  text: string;
  serendipity?: 'minor' | 'major';
};

/** The SCR of one spell: a failed one needs a failure roll before the project goes on. */
export type EnchantmentScr = {
  spellId: string;
  roll: number;
  total: number;
  failed: boolean;
  failureRoll: number | null;
  failureModifier: number;
  failure: EnchantmentFailure | null;
};

export type EnchantmentStatus = 'pending-failures' | 'in-progress' | 'suspended' | 'completed' | 'cancelled';
export const ENCHANTMENT_STATUSES: EnchantmentStatus[] = [
  'pending-failures',
  'in-progress',
  'suspended',
  'completed',
  'cancelled',
];

export type EnchantmentProject = {
  id: string;
  gameId: string;
  alchemistId: string;
  alchemistName: string;
  itemId: string;
  itemName: string;
  request: EnchantmentRequest;
  plan: EnchantmentPlan;
  scr: EnchantmentScr[];
  status: EnchantmentStatus;
  daysCompleted: number;
  extraDays: number;
  extraCost: number;
  notes: string | null;
  payer: ItemHolder | null;
  paid: number;
  refunded: number;
  ledgerEntryIds: string[];
  owner: string;
  createdAt: string;
  updatedAt: string | null;
  completedAt: string | null;
  version: number;
};

/** Body of PATCH /v1/enchantments/:id; `extraCost` (gold) is charged to the payer. */
export type UpdateEnchantmentDto = {
  extraDays?: number;
  extraCost?: number;
  notes?: string | null;
  version?: number;
};

export type CompleteEnchantmentResult = { project: EnchantmentProject; item: StrategicItem };

/** The enchantment of an item (`StrategicItem.enchantment`). */
export type ItemEnchantment = {
  projectId: string;
  itemLevel: number;
  alchemistId: string;
  alchemistName: string;
  spells: { spellId: string; name: string; level: number; listCode: string }[];
  properties: { kind: 'spell-adder' | 'pp-multiplier' | 'skill'; value: number; target?: string | null }[];
  completedAt: string;
};

/** Days left of a project, extra days included. */
export const enchantmentTotalDays = (project: Pick<EnchantmentProject, 'plan' | 'extraDays'>): number =>
  project.plan.workingDays + (project.extraDays || 0);

/** Whether a project is still open: it can progress, be suspended or be cancelled. */
export const isEnchantmentActive = (status: EnchantmentStatus): boolean =>
  status === 'pending-failures' || status === 'in-progress' || status === 'suspended';
