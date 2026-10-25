/** An error or warning of an import (workspace spec 024). `code` is stable and translated by the clients. */
export interface ImportIssue {
  code: string;
  message: string;
  /** JSON path in the file, like `data.characters[0].character.info.raceId`. */
  path?: string;
  kind?: string;
  id?: string;
  name?: string | null;
}

export type ExportKind = 'character' | 'faction';

export interface ImportStep {
  from: number;
  to: number;
  description: string;
}

export interface ImportFileCharacter {
  ref: string;
  name: string;
  level: number;
  raceName: string;
}

/** What an import would create, returned by the `dryRun` call. Nothing is written while `errors` is not empty. */
export interface ImportPreview {
  /** Kind of the file. */
  kind: ExportKind;
  /** What the import creates. */
  target: ExportKind;
  name: string;
  formatVersion: number;
  currentFormatVersion: number;
  appVersion: string;
  currentAppVersion: string;
  /** The file was upgraded from this format version. */
  upgradedFrom?: number;
  steps: ImportStep[];
  source: { gameName: string; factionName: string; realmName: string | null; exportedAt: string };
  summary: { characters: number; items: number; gold: number; xp: number };
  characters: ImportFileCharacter[];
  characterRef?: string;
  warnings: ImportIssue[];
  errors: ImportIssue[];
}

export interface ImportResult {
  kind: ExportKind;
  target: ExportKind;
  importId: string;
  /** The faction created, or the one that received the character. */
  factionId: string;
  characterIds: string[];
  itemCount: number;
  warnings: ImportIssue[];
}

export interface ImportOptions {
  dryRun?: boolean;
  /** The character to take from a faction file. */
  characterRef?: string;
  /** Name of the uploaded file, kept in the item ledger. */
  fileName?: string;
}

/** A downloaded export file. */
export interface ExportDownload {
  blob: Blob;
  fileName: string;
}
