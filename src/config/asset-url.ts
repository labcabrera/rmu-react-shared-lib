// Images and other static assets are stored as relative paths, so the data does not depend on where they
// are deployed (workspace spec 057, decision 4):
// - the base images live in rmu-mfe-assets (`images/races/elf.png`) and resolve against RMU_MFE_ASSETS_URI;
// - the user uploads live in rmu-api-media's bucket (`uploads/avatars/<id>.png`) and resolve against
//   RMU_MFE_MEDIA_URI (default `/media/`).
// Both are read through window.__RMU_CONFIG__ when rendered.

// Absolute URLs (http:, https:, data:, blob:...) and root-relative or protocol-relative paths.
const NOT_ASSET_PATH = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

/** Prefix of the paths of the user uploads (spec 057, decision 3). */
export const UPLOADS_PREFIX = 'uploads/';

const DEFAULT_MEDIA_URI = '/media/';

type RuntimeConfigWindow = { __RMU_CONFIG__?: Record<string, string | undefined> };

// RMU_MFE_MEDIA_URI is new (spec 057): a remote whose env-config template does not list it yet keeps a bare
// `process.env` reference, which throws in the browser. Then it is read from the shell's runtime config.
const mediaUri = (): string => {
  try {
    const value = process.env.RMU_MFE_MEDIA_URI;
    if (value) return value;
  } catch {
    // not rewritten by this bundle's webpack
  }
  const runtime = typeof window === 'undefined' ? undefined : (window as RuntimeConfigWindow).__RMU_CONFIG__;
  return runtime?.RMU_MFE_MEDIA_URI || DEFAULT_MEDIA_URI;
};

const join = (base: string, path: string): string => {
  const separator = base === '' || base.endsWith('/') ? '' : '/';
  return `${base}${separator}${path}`;
};

/** True for the path of a user upload (`uploads/…`), served by media instead of rmu-mfe-assets. */
export const isUploadPath = (path: string | null | undefined): boolean =>
  !!path && path.replace(/^\.\//, '').startsWith(UPLOADS_PREFIX);

/**
 * Returns the URL to render for an asset path. Absolute URLs are returned unchanged, so values
 * stored before the paths became relative keep working.
 */
export function resolveAssetUrl(path: string): string;
export function resolveAssetUrl(path: string | null | undefined): string | undefined;
export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (NOT_ASSET_PATH.test(path)) return path;
  const relative = path.replace(/^\.\//, '');
  if (relative.startsWith(UPLOADS_PREFIX)) {
    return join(mediaUri(), relative);
  }
  return join(process.env.RMU_MFE_ASSETS_URI || '', relative);
}

/** Widths of the generated thumbnails of the base images (workspace spec 058, decision 11). */
export type ThumbSize = 128 | 512;

const BASE_IMAGE = /^images\/(?!thumbs\/)([^/]+)\/([^/]+)\.[a-z0-9]+$/i;

/**
 * Path of the thumbnail of a base image (`images/races/elf.png` → `images/thumbs/128/races/elf.webp`), built by
 * rmu-mfe-assets. Undefined for anything else: uploads, absolute URLs, paths outside a category.
 */
export const thumbPath = (path: string | null | undefined, size: ThumbSize): string | undefined => {
  // Paths already resolved against RMU_MFE_ASSETS_URI (`${imageBaseUrl}images/...`) count as base images too.
  const assets = process.env.RMU_MFE_ASSETS_URI || '';
  const relative = assets && path?.startsWith(assets) ? path.slice(assets.length).replace(/^\//, '') : path;
  const match = relative?.replace(/^\.\//, '').match(BASE_IMAGE);
  return match ? `images/thumbs/${size}/${match[1]}/${match[2]}.webp` : undefined;
};

/** The smallest thumbnail that still looks sharp at `px` CSS pixels on a 2x screen. */
export const thumbSizeFor = (px: number): ThumbSize => (px <= 64 ? 128 : 512);

/**
 * URLs to try in order for a list of images: for each one its thumbnail (when `size` is given and it is a base
 * image), then the original. A missing thumbnail (an assets build without them) falls back to the original.
 */
export const assetCandidates = (paths: (string | null | undefined)[], size?: ThumbSize): string[] => {
  const urls: string[] = [];
  paths.forEach((path) => {
    const thumb = size ? thumbPath(path, size) : undefined;
    [thumb, path].forEach((candidate) => {
      const url = resolveAssetUrl(candidate);
      if (url && !urls.includes(url)) urls.push(url);
    });
  });
  return urls;
};
