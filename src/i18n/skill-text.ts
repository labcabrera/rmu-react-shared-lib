import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/** Namespace with the descriptions of the book skills, keyed by the skill id. */
export const SKILL_TEXT_NAMESPACE = 'skill-text';

/** The description of a skill, and its first paragraph for the places with little room. Empty when it has none. */
export type SkillText = {
  description: (skillId: string) => string;
  summary: (skillId: string) => string;
};

/**
 * Workspace spec 090: the description of a book skill in the current language, loaded when a screen needs it. A
 * specialized id (`skill@specialization`) uses the one of the skill. Reads the namespace directly, so that an id never
 * matches a key of the other namespaces. A skill created by a user has no text.
 */
export const useSkillText = (): SkillText => {
  const { t, i18n } = useTranslation(SKILL_TEXT_NAMESPACE, { useSuspense: false });
  const description = useCallback(
    (skillId: string) => {
      const text = i18n.getResource?.(i18n.language, SKILL_TEXT_NAMESPACE, skillId.split('@')[0]);
      return typeof text === 'string' ? text : '';
    },
    // `t` changes when the namespace finishes loading
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, i18n]
  );
  const summary = useCallback((skillId: string) => description(skillId).split('\n')[0], [description]);
  return { description, summary };
};
