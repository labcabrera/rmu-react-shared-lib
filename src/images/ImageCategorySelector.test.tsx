import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MediaImage } from '../api/image.dto';
import { renderWithProviders } from '../test/render';
import ImageCategorySelector, { canManageImage } from './ImageCategorySelector';

// Stable like the context value.
const auth = { isAuthenticated: true, user: { profile: { sub: 'user-1', groups: [] } } };
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
const fetchImages = vi.fn();
const deleteImage = vi.fn(async () => undefined);
const updateImage = vi.fn();
vi.mock('../api/image.api', () => ({
  fetchImages: (...args: unknown[]) => fetchImages(...args),
  deleteImage: (...args: unknown[]) => deleteImage(...(args as [])),
  updateImage: (...args: unknown[]) => updateImage(...args),
}));

const image = (extra: Partial<MediaImage>): MediaImage => ({
  id: 'x',
  category: 'avatars',
  url: 'images/avatars/x.png',
  storageKey: '',
  source: 'base',
  visibility: 'public',
  contentType: 'image/png',
  sizeBytes: 1,
  ...extra,
});

const base = image({ id: 'base:images/avatars/a.png', url: 'images/avatars/a.png', altText: 'Base one' });
const own = image({ id: 'u1', url: 'uploads/avatars/u1.png', source: 'user', owner: 'user-1', altText: 'Mine' });
const other = image({ id: 'u2', url: 'uploads/avatars/u2.png', source: 'user', owner: 'user-2', altText: 'Theirs' });

describe('canManageImage (spec 057)', () => {
  it('lets the owner or an admin manage uploads, and nobody base images', () => {
    expect(canManageImage(own, 'user-1', false)).toBe(true);
    expect(canManageImage(other, 'user-1', false)).toBe(false);
    expect(canManageImage(other, 'user-1', true)).toBe(true);
    expect(canManageImage(base, 'user-1', true)).toBe(false);
    expect(canManageImage({ ...own, source: undefined as never, id: 'base:images/x.png' }, 'user-1', true)).toBe(false);
  });
});

describe('ImageCategorySelector (spec 057)', () => {
  it('labels the source of each image and offers edit and delete only on the own uploads', async () => {
    fetchImages.mockResolvedValue({
      content: [base, own, other],
      pagination: { page: 0, size: 25, totalElements: 3, totalPages: 1 },
    });
    const onDeleted = vi.fn();
    renderWithProviders(<ImageCategorySelector onDeleted={onDeleted} />);

    const items = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(within(items[0]).getByText('image-source-base')).toBeInTheDocument();
    expect(within(items[0]).queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    expect(within(items[1]).getByText('image-source-user')).toBeInTheDocument();
    expect(within(items[2]).queryByRole('button', { name: 'delete' })).not.toBeInTheDocument();
    // Uploads resolve against RMU_MFE_MEDIA_URI (default /media/).
    expect(within(items[1]).getByRole('img')).toHaveAttribute('src', '/media/uploads/avatars/u1.png');

    await userEvent.click(within(items[1]).getByRole('button', { name: 'delete' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'delete' }));
    await waitFor(() => expect(deleteImage).toHaveBeenCalledWith(auth, 'u1'));
    expect(onDeleted).toHaveBeenCalledWith(own);
  });
});
