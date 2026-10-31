import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonBase } from '@mui/material';
import { assetCandidates, ThumbSize, thumbSizeFor } from '../config/asset-url';
import { defaultImages, EntityKind } from '../config/default-images';
import ImageSelectorDialog from '../images/ImageSelectorDialog';

const defaultImage = 'images/generic/configuration.png';

type ResponsiveSize = { xs: number; sm?: number; md?: number; lg?: number };

/**
 * `sm` 64 px (dialogs), `md` 96 px (headers), `lg` the image of a detail page's side panel: 80 px on phones, then
 * its column up to 200 px (the side panel is narrower than that below ~1440 px, spec 017).
 */
export type EntityImageSize = 'sm' | 'md' | 'lg' | number | ResponsiveSize;

const sizeSx = (size: EntityImageSize) => {
  if (size === 'sm') return { width: 64 };
  if (size === 'md') return { width: 96 };
  if (size === 'lg') return { width: { xs: 80, sm: 56, md: 72, lg: '100%' }, maxWidth: { lg: 200 } };
  return { width: size };
};

const thumbSizeOf = (size: EntityImageSize): ThumbSize => {
  if (size === 'sm') return 128;
  if (typeof size === 'number') return thumbSizeFor(size);
  return 512;
};

export interface EntityImageProps {
  image?: string | null;
  /** Images tried in order when `image` is missing or fails to load. */
  fallbackImages?: string[];
  /** Kind of entity: its default image is tried after `fallbackImages`. */
  kind?: EntityKind;
  size?: EntityImageSize;
  /** Accessible text; empty (decorative) by default, since the entity's name is shown next to it. */
  alt?: string;
  /** Makes the image a button that opens the image selector and reports the chosen image. */
  onImageChange?: (image: string) => void;
  /** Makes the image a button (when the caller opens its own dialog). */
  onClick?: () => void;
  /** Accessible name of the button; "Change image" by default. */
  actionLabel?: string;
  /** `view-transition-name` of the image, to morph from the list card. */
  imageTransitionName?: string;
}

/**
 * Image of an entity on its detail page, header and forms (spec 058, decision 6): always a square with the corner
 * radius of the cards, loading the thumbnail of base images and falling back to the original, the given fallbacks,
 * the default image of its kind and a generic one.
 */
const EntityImage: FC<EntityImageProps> = ({
  image,
  fallbackImages = [],
  kind,
  size = 'lg',
  alt = '',
  onImageChange,
  onClick,
  actionLabel,
  imageTransitionName,
}) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const candidates = assetCandidates(
    [image, ...fallbackImages, kind ? defaultImages[kind] : undefined, defaultImage],
    thumbSizeOf(size)
  );
  const [failed, setFailed] = useState(0);
  const key = candidates.join('|');
  useEffect(() => setFailed(0), [key]);
  const src = candidates[Math.min(failed, candidates.length - 1)];

  const picture = (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => failed < candidates.length - 1 && setFailed(failed + 1)}
      sx={(theme) => ({
        ...sizeSx(size),
        display: 'block',
        aspectRatio: '1',
        height: 'auto',
        objectFit: 'cover',
        borderRadius: `${theme.radius.md}px`,
        border: 1,
        borderColor: 'divider',
        flexShrink: 0,
        viewTransitionName: imageTransitionName,
      })}
    />
  );

  const action = onImageChange ? () => setDialogOpen(true) : onClick;
  if (!action) return picture;
  return (
    <>
      <ButtonBase
        onClick={action}
        aria-label={actionLabel ?? t('change-image')}
        sx={(theme) => ({
          borderRadius: `${theme.radius.md}px`,
          flexShrink: 0,
          // The `lg` image fills its column: the button around it must too.
          ...(size === 'lg' && { width: { lg: '100%' }, maxWidth: { lg: 200 } }),
          '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
        })}
      >
        {picture}
      </ButtonBase>
      {onImageChange && (
        <ImageSelectorDialog
          value={image ?? undefined}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSelect={(selected) => onImageChange(selected)}
        />
      )}
    </>
  );
};

export default EntityImage;
