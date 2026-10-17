// Images and other static assets are stored as paths relative to the root of rmu-mfe-assets, for
// example `images/races/elf.png`, so the data does not depend on where the assets are deployed.
// They are resolved against RMU_MFE_ASSETS_URI (read through window.__RMU_CONFIG__) when rendered.

// Absolute URLs (http:, https:, data:, blob:...) and root-relative or protocol-relative paths.
const NOT_ASSET_PATH = /^(?:[a-z][a-z0-9+.-]*:|\/)/i;

/**
 * Returns the URL to render for an asset path. Absolute URLs are returned unchanged, so values
 * stored before the paths became relative keep working.
 */
export function resolveAssetUrl(path: string): string;
export function resolveAssetUrl(path: string | null | undefined): string | undefined;
export function resolveAssetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (NOT_ASSET_PATH.test(path)) return path;
  const base = process.env.RMU_MFE_ASSETS_URI || '';
  const separator = base === '' || base.endsWith('/') ? '' : '/';
  return `${base}${separator}${path.replace(/^\.\//, '')}`;
}
