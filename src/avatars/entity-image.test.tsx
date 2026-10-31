import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import EntityCard from '../cards/EntityCard';
import { renderWithProviders } from '../test/render';
import EntityAvatar from './EntityAvatar';
import EntityImage from './EntityImage';

vi.mock('../images/ImageSelectorDialog', () => ({
  default: ({ open }: { open: boolean }) => (open ? <div role="dialog" /> : null),
}));

const original = process.env.RMU_MFE_ASSETS_URI;
beforeEach(() => {
  process.env.RMU_MFE_ASSETS_URI = '/a/';
});
afterEach(() => {
  process.env.RMU_MFE_ASSETS_URI = original;
});

const img = (container: HTMLElement) => container.querySelector('img') as HTMLImageElement;

describe('EntityImage (spec 058)', () => {
  it('loads the thumbnail of a base image, then the original, then the fallbacks', () => {
    const { container } = renderWithProviders(
      <EntityImage image="images/races/elf.png" fallbackImages={['images/races/unknown.png']} size="sm" />
    );
    expect(img(container).getAttribute('src')).toBe('/a/images/thumbs/128/races/elf.webp');
    fireEvent.error(img(container));
    expect(img(container).getAttribute('src')).toBe('/a/images/races/elf.png');
    fireEvent.error(img(container));
    expect(img(container).getAttribute('src')).toBe('/a/images/thumbs/128/races/unknown.webp');
  });

  it('is a square with the radius of the cards', () => {
    const { container } = renderWithProviders(<EntityImage image="images/races/elf.png" size="md" />);
    expect(img(container)).toHaveStyle({ width: '96px', aspectRatio: '1', borderRadius: '12px' });
  });

  it('opens the image selector when it can change the image', async () => {
    renderWithProviders(<EntityImage image="images/races/elf.png" onImageChange={vi.fn()} />);
    await userEvent.setup().click(screen.getByRole('button'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('is not a button without an action', () => {
    renderWithProviders(<EntityImage image="images/races/elf.png" />);
    expect(screen.queryByRole('button')).toBeNull();
  });
});

describe('EntityAvatar (spec 058)', () => {
  it('is a slightly rounded square that loads a thumbnail', () => {
    const { container } = renderWithProviders(<EntityAvatar name="Elf" imageUrl="images/races/elf.png" size={24} />);
    expect(container.querySelector('.MuiAvatar-circular')).toBeNull();
    expect(container.querySelector('.MuiAvatar-root')).toHaveStyle({ borderRadius: '4px', width: '24px' });
    expect(img(container).getAttribute('src')).toBe('/a/images/thumbs/128/races/elf.webp');
  });
});

describe('EntityCard (spec 058)', () => {
  it('shows the 512 px thumbnail in a square', () => {
    const { container } = renderWithProviders(<EntityCard title="Elf" image="images/races/elf.png" />);
    expect(img(container).getAttribute('src')).toBe('/a/images/thumbs/512/races/elf.webp');
    expect(img(container)).toHaveStyle({ aspectRatio: '1' });
  });
});
