/** A rulebook text with its Spanish translation, when there is one. */
export interface LocalizedText {
  en: string;
  es?: string;
}

export interface DifficultyExample {
  /** Maneuver difficulty key (`c`, `s`, `r`, … `ni`, as in MANEUVER_DIFFICULTIES). */
  difficulty: string;
  text: LocalizedText;
}

/** Example difficulties of a skill (Character Companion ch. 2, spec 037). Needs Core Law access. */
export interface SkillDifficultyGuide {
  /** The skill id, or `general` for the general scale. */
  skillId: string;
  /** What the examples are about, when the book says it (e.g. Spell Mastery). */
  context?: LocalizedText;
  /** The skill whose examples this one repeats. */
  sharedWith?: string;
  /** From the easiest difficulty to the hardest; a skill may only have some of them. */
  examples: DifficultyExample[];
  /** True when the skill has no examples and the general scale was returned. */
  fallback: boolean;
}

/** The text in the user's language, falling back to the English of the book. */
export const localizedText = (text: LocalizedText | undefined, language: string | undefined): string =>
  !text ? '' : language?.startsWith('es') && text.es ? text.es : text.en;
