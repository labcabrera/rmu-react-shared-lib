import { afterEach, describe, expect, it } from 'vitest';
import { assetCandidates, isUploadPath, resolveAssetUrl, thumbPath, thumbSizeFor } from './asset-url';

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

describe('thumbnails (spec 058)', () => {
  const original = process.env.RMU_MFE_ASSETS_URI;
  afterEach(() => {
    process.env.RMU_MFE_ASSETS_URI = original;
  });

  it('maps a base image to its webp thumbnail', () => {
    expect(thumbPath('images/races/elf-01.png', 128)).toBe('images/thumbs/128/races/elf-01.webp');
    expect(thumbPath('./images/npcs/warg.alt.png', 512)).toBe('images/thumbs/512/npcs/warg.alt.webp');
    expect(thumbPath('images/items/category-melee-weapon@blade.png', 128)).toBe(
      'images/thumbs/128/items/category-melee-weapon@blade.webp'
    );
  });

  it('has no thumbnail for uploads, absolute URLs, thumbnails or paths outside a category', () => {
    expect(thumbPath('uploads/races/a.png', 128)).toBeUndefined();
    expect(thumbPath('https://x/images/races/a.png', 128)).toBeUndefined();
    expect(thumbPath('images/thumbs/128/races/a.webp', 128)).toBeUndefined();
    expect(thumbPath('images/a.png', 128)).toBeUndefined();
    expect(thumbPath(null, 128)).toBeUndefined();
  });

  it('also maps base images already resolved against RMU_MFE_ASSETS_URI', () => {
    process.env.RMU_MFE_ASSETS_URI = '/mfe/assets/';
    expect(thumbPath('/mfe/assets/images/generic/core.png', 512)).toBe('images/thumbs/512/generic/core.webp');
    expect(thumbPath('/other/images/generic/core.png', 512)).toBeUndefined();
  });

  it('picks the thumbnail size for a rendered size', () => {
    expect(thumbSizeFor(40)).toBe(128);
    expect(thumbSizeFor(64)).toBe(128);
    expect(thumbSizeFor(96)).toBe(512);
  });

  it('lists the thumbnail before the original, without duplicates', () => {
    process.env.RMU_MFE_ASSETS_URI = '/a/';
    process.env.RMU_MFE_MEDIA_URI = '/media/';
    expect(assetCandidates(['images/races/x.png', 'uploads/u.png', 'images/races/x.png', null], 128)).toEqual([
      '/a/images/thumbs/128/races/x.webp',
      '/a/images/races/x.png',
      '/media/uploads/u.png',
    ]);
    expect(assetCandidates(['images/races/x.png'])).toEqual(['/a/images/races/x.png']);
  });
});
