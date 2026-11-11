import { slugify, splitHeadingId } from './markdown-headings';

/** The part of a Markdown syntax tree (mdast) this plugin reads. */
type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hProperties?: Record<string, unknown> };
};

const textOf = (node: MdNode): string =>
  node.type === 'text' || node.type === 'inlineCode' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

const visit = (node: MdNode): void => {
  if (node.type === 'heading') {
    // `## Title {#id}`: the id is dropped from the text shown and becomes the anchor of the heading.
    const last = node.children?.[node.children.length - 1];
    let explicit: string | undefined;
    if (last?.type === 'text' && last.value) {
      const split = splitHeadingId(last.value);
      if (split.text !== last.value) {
        explicit = split.id;
        last.value = split.text;
      }
    }
    const id = explicit ?? slugify(textOf(node).trim());
    node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
  }
  node.children?.forEach(visit);
};

/**
 * Remark plugin (workspace specs 099 and 102): every heading gets an anchor id, the one given with `{#id}` at its end
 * or else the slug of its text.
 */
export const remarkHeadingIds = () => (tree: MdNode) => visit(tree);
