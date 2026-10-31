import React, { FC, ReactNode, useState } from 'react';
import { Avatar, Box } from '@mui/material';
import { assetCandidates, thumbSizeFor } from '../config/asset-url';
import { defaultImages, EntityKind } from '../config/default-images';

/** Up to two initials of a name, for an avatar without image. */
export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

/**
 * Sizes of the avatars of the pickers (spec 058, decision 10): as large as each place allows, so the image reads.
 * `option` a row of an open list, `input` the chosen value inside a field, `chip` a medium chip (32 px high),
 * `smallChip` a small one (24 px), `tile` the chips of the tiles mode (40 px high).
 */
export const avatarSize = { option: 40, input: 32, chip: 24, smallChip: 20, tile: 32 } as const;

export interface EntityAvatarProps {
  /** Name of the entity: its initials are the last fallback. */
  name: string;
  /** Its own image (an asset path or a URL). */
  imageUrl?: string | null;
  /** Kind of entity: its default image is tried when it has none or it fails to load. */
  kind?: EntityKind;
  /** Shown instead of the image and the initials. */
  icon?: ReactNode;
  size?: number;
  /** Greyed out (a disabled option). */
  faded?: boolean;
  /** CSS filter for the image, such as the sepia filter of the item illustrations. */
  imageFilter?: string;
  /** Set by MUI when it is the `avatar` of a Chip. */
  className?: string;
}

/**
 * Image of an entity (spec 046, decision 8): its own image, then the default one of its kind, then its initials.
 * Decorative (`alt=""`): its name is always shown next to it.
 *
 * Always a square with slightly rounded corners, loading the thumbnail of base images (spec 058, decisions 10 and
 * 11). Inside a Chip it keeps its size (MUI would force its own) and sits 2-4 px from the chip's edge.
 */
const EntityAvatar: FC<EntityAvatarProps> = ({
  name,
  imageUrl,
  kind,
  icon,
  size = 40,
  faded = false,
  imageFilter,
  className,
}) => {
  const [failed, setFailed] = useState<string[]>([]);
  const candidates = assetCandidates([imageUrl, kind ? defaultImages[kind] : undefined], thumbSizeFor(size));
  const src = icon ? undefined : candidates.find((url) => !failed.includes(url));
  return (
    <Avatar
      variant="rounded"
      className={className}
      aria-hidden
      sx={(theme) => ({
        width: size,
        height: size,
        borderRadius: `${size <= 32 ? 4 : theme.radius.sm}px`,
        '&&.MuiChip-avatar': { width: size, height: size, ml: size >= 24 ? '4px' : '2px', mr: '-4px' },
        flexShrink: 0,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: 'background.light',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        filter: faded ? 'grayscale(1)' : undefined,
        opacity: faded ? 0.6 : 1,
      })}
    >
      {src ? (
        <Box
          component="img"
          src={src}
          alt=""
          onError={() => setFailed((previous) => [...previous, src])}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', filter: imageFilter }}
        />
      ) : (
        (icon ?? initialsOf(name))
      )}
    </Avatar>
  );
};

export default EntityAvatar;
