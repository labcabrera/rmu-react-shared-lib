/** Translations of an English text by language code (`es`, spec 037). */
export type Translations = Record<string, string>;

/** The translation for the language (`es-ES` uses `es`), or the English text. */
export const translated = (
  text: string,
  translations: Translations | undefined,
  language: string | undefined
): string => (language && translations?.[language.split('-')[0]]) || text;

export interface AbsoluteManeuverTable {
  name: string;
  table: AbsoluteManeuverTableEntry[];
  unusualEvent: string;
  unusualEventTranslations?: Translations;
}

export interface AbsoluteManeuverTableEntry {
  min: number | null;
  max: number | null;
  result: AbsoluteManeuverResult;
}

export interface PercentManeuverResult {
  percent: number;
  critical: string | undefined;
  message: string;
}

export interface AbsoluteManeuverResult {
  result: string;
  message: string;
  messageTranslations?: Translations;
  penaltyUntilAbsoluteSuccess?: number;
  bonusUntilAbsoluteFailure?: number;
}

export interface EnduranceManeuverResult {
  result: string;
  message: string;
  messageTranslations?: Translations;
  fatigue: number;
  hitPoints: number;
  bonus: number;
}
