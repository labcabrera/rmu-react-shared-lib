/** The two modes of the Markdown editor (workspace spec 102): visual (rich text) or the raw Markdown. */
export type MarkdownEditorMode = 'rich-text' | 'source';

const STORAGE_KEY = 'rmu.markdown-editor.mode';

/** The mode the user used last, visual by default. Storage may be unavailable: then it is always visual. */
export const readEditorMode = (): MarkdownEditorMode => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'source' ? 'source' : 'rich-text';
  } catch {
    return 'rich-text';
  }
};

export const storeEditorMode = (mode: MarkdownEditorMode): void => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // a per-user convenience: nothing to do without storage
  }
};
