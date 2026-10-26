/** The result of an attack roll (`16DP`: 16 hits, a D Puncture critical). */
export interface AttackLookup {
  text: string;
  damage: number;
  criticalType: string | null;
  criticalSeverity: string | null;
}

/** A cell of a whole attack table, with its armor type (1-10). */
export interface AttackTableCell extends AttackLookup {
  armorType: number;
}

/** A roll band of an attack table with the cells of AT 1 to 10. */
export interface AttackTableRow {
  rollMin: number;
  rollMax: number;
  results: AttackTableCell[];
}

/** A whole Medium attack table: rows from the highest band down (workspace spec 035). */
export interface AttackTable {
  id: string;
  rows: AttackTableRow[];
}

/** An effect of a critical or fumble row: its status plus the fields of that status (value, rounds, delay...). */
export interface TableEffect {
  status: string;
  [field: string]: unknown;
}

/** Injury classification of a critical row (workspace spec 013). */
export interface TableInjury {
  type?: string;
  secondary?: string[];
  flags?: string[];
}

export interface CriticalTableEntry {
  rollMin: number;
  rollMax: number;
  dmg: number;
  location: string | null;
  message: string;
  effects?: TableEffect[];
  injury?: TableInjury | null;
}

export const CRITICAL_SEVERITIES = ['A', 'B', 'C', 'D', 'E'] as const;
export type CriticalSeverity = (typeof CRITICAL_SEVERITIES)[number];

/** Every severity of a critical type; a severity without data is left out. */
export interface CriticalTable {
  type: string;
  severities: Partial<Record<CriticalSeverity, CriticalTableEntry[]>>;
}

export interface FumbleTableEntry {
  rollMin: number;
  rollMax: number;
  text: string;
  effects?: TableEffect[];
}

export interface FumbleTable {
  id: string;
  entries: FumbleTableEntry[];
}
