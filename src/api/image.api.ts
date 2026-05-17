import { AuthContextProps } from 'react-oidc-context';
import { mediaApiBaseUrl } from '../config/config.service';
import callApi from './api';
import { ImageCategory, MediaImagePage, UploadImageInput } from './image.dto';

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
