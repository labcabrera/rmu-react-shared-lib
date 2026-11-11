import { useCallback, useEffect, useRef, useState } from 'react';

export type MarkdownDraft = {
  /** The text saved the last time it was not stored, with the version it was edited from. */
  text: string;
  baseVersion?: number;
  savedAt: string;
};

const PREFIX = 'rmu.markdown-draft.';

const read = (key: string): MarkdownDraft | undefined => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as MarkdownDraft) : undefined;
  } catch {
    return undefined;
  }
};

/**
 * A copy in the browser of a Markdown text not saved yet (workspace spec 102, decision 7), so closing the tab does not
 * lose it. `save` is debounced; storage may be unavailable, and then there is simply no draft.
 */
export const useMarkdownDraft = (key: string, delayMs = 800) => {
  const [initial] = useState(() => read(key));
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const save = useCallback(
    (text: string, baseVersion?: number) => {
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        try {
          const draft: MarkdownDraft = { text, baseVersion, savedAt: new Date().toISOString() };
          localStorage.setItem(PREFIX + key, JSON.stringify(draft));
        } catch {
          // no storage: no draft
        }
      }, delayMs);
    },
    [key, delayMs]
  );

  const clear = useCallback(() => {
    clearTimeout(timer.current);
    try {
      localStorage.removeItem(PREFIX + key);
    } catch {
      // no storage: nothing to clear
    }
  }, [key]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { draft: initial, save, clear };
};
