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

export type MediaImage = {
  id: string;
  category: ImageCategory;
  url: string;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  originalFilename?: string;
  altText?: string;
  metadata?: Record<string, string>;
  owner: string;
};

export type MediaImagePage = {
  content: MediaImage[];
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
};

export type UploadImageInput = {
  file: Blob;
  filename: string;
  category: ImageCategory;
  altText?: string;
  metadata?: Record<string, string>;
};
