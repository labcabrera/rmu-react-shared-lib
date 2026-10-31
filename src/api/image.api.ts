import { AuthContextProps } from 'react-oidc-context';
import { mediaApiBaseUrl } from '../config/config.service';
import callApi from './api';
import { ImageCategory, MediaImage, MediaImagePage, UpdateImageInput, UploadImageInput } from './image.dto';

/** Lists the base images and the uploads of a category (workspace spec 057: `source` tells them apart). */
export async function fetchImages(
  category: ImageCategory,
  page = 0,
  size = 24,
  auth: AuthContextProps
): Promise<MediaImagePage> {
  const params = new URLSearchParams({
    q: `category==${category}`,
    page: String(page),
    size: String(size),
  });
  return callApi(auth, `${mediaApiBaseUrl}/images?${params.toString()}`, { method: 'GET' });
}

export async function uploadImage(auth: AuthContextProps, input: UploadImageInput): Promise<MediaImage> {
  const formData = new FormData();
  formData.append('file', input.file, input.filename);
  formData.append('category', input.category);
  if (input.altText) formData.append('altText', input.altText);
  if (input.metadata) formData.append('metadata', JSON.stringify(input.metadata));
  return callApi(auth, `${mediaApiBaseUrl}/images`, {
    method: 'POST',
    body: formData,
  });
}

/** Updates the metadata of an upload. Base images are read only: the API answers 403 `base-image-read-only`. */
export async function updateImage(auth: AuthContextProps, id: string, input: UpdateImageInput): Promise<MediaImage> {
  const formData = new FormData();
  if (input.altText !== undefined) formData.append('altText', input.altText);
  if (input.category) formData.append('category', input.category);
  if (input.version !== undefined) formData.append('version', String(input.version));
  return callApi(auth, `${mediaApiBaseUrl}/images/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: formData,
  });
}

/** Deletes an upload (owner or admin). Base images are read only: the API answers 403 `base-image-read-only`. */
export async function deleteImage(auth: AuthContextProps, id: string): Promise<void> {
  await callApi(auth, `${mediaApiBaseUrl}/images/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
