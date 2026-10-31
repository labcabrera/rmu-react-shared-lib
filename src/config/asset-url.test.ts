import { afterEach, describe, expect, it } from 'vitest';
import { isUploadPath, resolveAssetUrl } from './asset-url';

describe('resolveAssetUrl', () => {
  const original = { assets: process.env.RMU_MFE_ASSETS_URI, media: process.env.RMU_MFE_MEDIA_URI };

  afterEach(() => {
    process.env.RMU_MFE_ASSETS_URI = original.assets;
    process.env.RMU_MFE_MEDIA_URI = original.media;
    delete (window as { __RMU_CONFIG__?: unknown }).__RMU_CONFIG__;
  });

  it('resolves base images against RMU_MFE_ASSETS_URI', () => {
    process.env.RMU_MFE_ASSETS_URI = '/mfe/assets/';
    expect(resolveAssetUrl('images/races/elf.png')).toBe('/mfe/assets/images/races/elf.png');
    expect(resolveAssetUrl('./images/races/elf.png')).toBe('/mfe/assets/images/races/elf.png');
  });

  it('adds the separator when the base has no trailing slash', () => {
    process.env.RMU_MFE_ASSETS_URI = 'https://cdn.example.com/assets';
    expect(resolveAssetUrl('images/x.png')).toBe('https://cdn.example.com/assets/images/x.png');
  });

  it('resolves user uploads against RMU_MFE_MEDIA_URI', () => {
    process.env.RMU_MFE_MEDIA_URI = 'https://media.example.com';
    expect(resolveAssetUrl('uploads/avatars/a.png')).toBe('https://media.example.com/uploads/avatars/a.png');
  });

  it('falls back to the runtime config and then to /media/ for uploads', () => {
    delete process.env.RMU_MFE_MEDIA_URI;
    expect(resolveAssetUrl('uploads/avatars/a.png')).toBe('/media/uploads/avatars/a.png');
    (window as { __RMU_CONFIG__?: unknown }).__RMU_CONFIG__ = { RMU_MFE_MEDIA_URI: '/files/' };
    expect(resolveAssetUrl('uploads/avatars/a.png')).toBe('/files/uploads/avatars/a.png');
  });

  it('keeps absolute and root-relative URLs and empty values', () => {
    expect(resolveAssetUrl('https://x.test/a.png')).toBe('https://x.test/a.png');
    expect(resolveAssetUrl('data:image/png;base64,AA')).toBe('data:image/png;base64,AA');
    expect(resolveAssetUrl('/media/uploads/a.png')).toBe('/media/uploads/a.png');
    expect(resolveAssetUrl(undefined)).toBeUndefined();
    expect(resolveAssetUrl('')).toBeUndefined();
  });

  it('tells user uploads apart', () => {
    expect(isUploadPath('uploads/npcs/a.png')).toBe(true);
    expect(isUploadPath('images/uploads/a.png')).toBe(false);
    expect(isUploadPath(undefined)).toBe(false);
  });
});
