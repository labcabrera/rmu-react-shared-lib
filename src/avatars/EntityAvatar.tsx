import React, { FC, ReactNode, useState } from 'react';
import { Avatar, Box } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';
import { defaultImages, EntityKind } from '../config/default-images';

/** Up to two initials of a name, for an avatar without image. */
export const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');

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
  variant?: 'circular' | 'rounded' | 'square';
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
 */
const EntityAvatar: FC<EntityAvatarProps> = ({
  name,
  imageUrl,
  kind,
  icon,
  size = 40,
  variant = 'rounded',
  faded = false,
  imageFilter,
  className,
}) => {
  const [failed, setFailed] = useState<string[]>([]);
  const candidates = [resolveAssetUrl(imageUrl), kind ? resolveAssetUrl(defaultImages[kind]) : undefined].filter(
    (url): url is string => !!url
  );
  const src = icon ? undefined : candidates.find((url) => !failed.includes(url));
  return (
    <Avatar
      variant={variant}
      className={className}
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        fontSize: size * 0.4,
        fontWeight: 700,
        bgcolor: 'background.light',
        color: 'text.primary',
        border: 1,
        borderColor: 'divider',
        filter: faded ? 'grayscale(1)' : undefined,
        opacity: faded ? 0.6 : 1,
      }}
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
