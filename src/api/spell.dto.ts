export type SpellType = 'alchemical' | 'elemental' | 'force' | 'informational' | 'utility';
export type SpellSubtype = 'ball' | 'directed' | 'mental-attack' | 'subconscious';
export type SpellDurationType = 'concentration' | 'permanent' | 'lvl' | 'rr-failure';
export type SpellDurationScale = 'round' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
export type SpellRangeType = 'self' | 'touch' | 'distance' | 'distance-level';
export type SpellTargetMode = 'target' | 'area';
export type SpellTargetType = 'person' | 'item' | 'spell' | 'gateway' | 'lock';

export const SPELL_TYPES: SpellType[] = ['alchemical', 'elemental', 'force', 'informational', 'utility'];
export const SPELL_SUBTYPES: SpellSubtype[] = ['ball', 'directed', 'mental-attack', 'subconscious'];
export const SPELL_DURATION_TYPES: SpellDurationType[] = ['concentration', 'permanent', 'lvl', 'rr-failure'];

export type Spell = {
  id: string;
  spellListId: string;
  name: string;
  level: number;
  modifiers: SpellModifiers;
  description: string | null;
  imageUrl: string | null;
};

export type SpellModifiers = {
  type: SpellType;
  subtype: SpellSubtype | null;
  range: SpellRange | null;
  duration: SpellDuration | null;
  target: SpellTarget | null;
  instant: boolean | null;
};

export type SpellRange = {
  type: SpellRangeType;
  value: number | null;
};

export type SpellDuration = {
  type: SpellDurationType;
  duration: number | null;
  durationScale: SpellDurationScale | null;
  requiredConcentration: boolean | null;
  failureScale: number | null;
};

export type SpellTarget = {
  mode: SpellTargetMode;
  types: SpellTargetType[] | null;
  count: number | null;
  modifier: string | null;
};

export type CreateSpellDto = Omit<Spell, 'id'>;

export type UpdateSpellDto = Partial<Omit<Spell, 'id'>>;
