/** Anchor id of a heading: lowercase, without accents, words joined by dashes. */
export const slugify = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const EXPLICIT_ID = /\s*\{#([A-Za-z0-9_-]+)\}\s*$/;

/**
 * A heading text and its anchor id. `## Parar al que viene {#parry}` keeps the id `parry` in every language, so links
 * to a part of a page survive the translation; without `{#…}` the id is the slug of the text.
 */
export const splitHeadingId = (text: string): { text: string; id: string } => {
  const match = EXPLICIT_ID.exec(text);
  const plain = match ? text.slice(0, match.index) : text;
  return { text: plain, id: match ? match[1] : slugify(plain) };
};

export type MarkdownHeading = { text: string; id: string };

/** Plain text of a Markdown heading line: without emphasis, code marks or links. */
const plainText = (markdown: string): string =>
  markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`~]/g, '')
    .trim();

/** The `##` headings of a document, outside code blocks, for its table of contents. */
export const extractHeadings = (markdown: string): MarkdownHeading[] => {
  const headings: MarkdownHeading[] = [];
  let fenced = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
    const match = !fenced && /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (match) {
      const explicit = EXPLICIT_ID.exec(match[1]);
      const text = plainText(explicit ? match[1].slice(0, explicit.index) : match[1]);
      headings.push({ text, id: explicit ? explicit[1] : slugify(text) });
    }
  }
  return headings;
};
