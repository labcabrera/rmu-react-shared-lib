import { resolveAssetUrl } from '../config/asset-url';

/** Where a link of a document points: an anchor of the same page, a route of the app or an external URL. */
export type MarkdownLink = { kind: 'external' | 'anchor' | 'route'; to: string };

const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/** Default resolution of a link: `#x` anchors, `http(s)`/`mailto` outside in a new tab, anything else as a route. */
export const defaultMarkdownLink = (href: string): MarkdownLink => {
  if (href.startsWith('#')) return { kind: 'anchor', to: href };
  if (SCHEME.test(href) || href.startsWith('//')) return { kind: 'external', to: href };
  return { kind: 'route', to: href };
};

/**
 * Images a document may embed (workspace spec 102, decision 4): only the files of the application, the uploads of
 * media (`uploads/…`) and the base images (`images/…`). External, absolute and data URLs are not shown, so a page
 * cannot track its readers or break when another site goes away.
 */
export const isEmbeddableImage = (src: string | null | undefined): boolean => {
  if (!src) return false;
  const path = src.replace(/^\.\//, '');
  if (SCHEME.test(path) || path.startsWith('/')) return false;
  return /^(uploads|images)\//.test(path) && !path.includes('..');
};

/** URL to show an embeddable image, or undefined when it must not be shown. */
export const defaultMarkdownImage = (src: string | null | undefined): string | undefined =>
  isEmbeddableImage(src) ? resolveAssetUrl(src!.replace(/^\.\//, '')) : undefined;
