export const IMAGE_CATEGORIES = [
  'actions',
  'avatars',
  'backgrounds',
  'doc',
  'generic',
  'icons',
  'items',
  'npcs',
  'photos',
  'professions',
  'races',
  'user-data',
] as const;

export type ImageCategory = (typeof IMAGE_CATEGORIES)[number];

/** `base`: a file of rmu-mfe-assets, read only; `user`: an upload (workspace spec 057, decision 2). */
export type ImageSource = 'base' | 'user';

/** Every image is public for now; `friends` and `private` are reserved (spec 057, decision 8). */
export type ImageVisibility = 'public' | 'friends' | 'private';

/** Prefix of the id of a base image, derived from its path (`base:images/races/elf.png`). */
export const BASE_IMAGE_ID_PREFIX = 'base:';

export type MediaImage = {
  /** `base:<path>` for a base image, a uuid for an upload. */
  id: string;
  category: ImageCategory;
  /** Relative path to store: `images/…` for a base image, `uploads/…` for an upload (see config/asset-url.ts). */
  url: string;
  storageKey: string;
  source: ImageSource;
  visibility: ImageVisibility;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  altText?: string;
  metadata?: Record<string, string>;
  /** The id of the user who uploaded it; empty or absent for a base image. */
  owner?: string;
  version?: number;
};

/** A base image: either `source` says so or, for an older API, the id does. */
export const isBaseImage = (image: Pick<MediaImage, 'id' | 'source'>): boolean =>
  image.source === 'base' || image.id.startsWith(BASE_IMAGE_ID_PREFIX);

/** The path to store for an image: its relative `url` (the storage key only for older records without one). */
export const imagePath = (image: Pick<MediaImage, 'url' | 'storageKey'>): string => image.url || image.storageKey;

export type MediaImagePage = {
  content: MediaImage[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type UpdateImageInput = {
  altText?: string;
  category?: ImageCategory;
  /** The `version` read, so that a stale edit answers 409 `version-conflict`. */
  version?: number;
};

export type UploadImageInput = {
  file: Blob;
  filename: string;
  category: ImageCategory;
  altText?: string;
  metadata?: Record<string, string>;
};
