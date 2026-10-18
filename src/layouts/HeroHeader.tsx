import React, { FC, ReactNode } from 'react';
import { Avatar, Box, ButtonBase, Card, Stack, Typography, useScrollTrigger } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';

export interface HeroHeaderProps {
  title: string;
  /** Small line above the title (level and profession, type…). */
  overline?: ReactNode;
  image?: string | null;
  /** Chips under the title (race, profession, faction…). Hidden when compact. */
  chips?: ReactNode;
  /** Resource bars (HP, PP, XP). Hidden when compact. */
  resources?: ReactNode;
  /** Key numbers. They stay visible when compact, from md up. */
  pills?: ReactNode;
  actions?: ReactNode;
  /** `view-transition-name` of the image, to morph from the list card. */
  imageTransitionName?: string;
  /** Makes the image a button (for example to change it). */
  onImageClick?: () => void;
  /** Accessible name of the image button. */
  imageActionLabel?: string;
}

/** Scroll distance after which the header shrinks to a bar. */
const COMPACT_THRESHOLD = 160;

/**
 * Entity header that replaces the side panel of a detail page: image, title, chips, resources and key
 * numbers. It sticks under the app bar and shrinks to a bar while scrolling, so the content keeps the
 * full width and the key numbers stay in sight.
 */
const HeroHeader: FC<HeroHeaderProps> = ({
  title,
  overline,
  image,
  chips,
  resources,
  pills,
  actions,
  imageTransitionName,
  onImageClick,
  imageActionLabel,
}) => {
  const compact = useScrollTrigger({ disableHysteresis: true, threshold: COMPACT_THRESHOLD });
  const avatarSize = compact ? 40 : { xs: 64, md: 96 };

  const avatar = (
    <Avatar
      variant="rounded"
      src={image ? resolveAssetUrl(image) : undefined}
      alt={title}
      sx={(theme) => ({
        width: avatarSize,
        height: avatarSize,
        borderRadius: `${theme.radius.md}px`,
        border: 1,
        borderColor: 'divider',
        viewTransitionName: imageTransitionName,
        transition: theme.transitions.create(['width', 'height'], { duration: theme.motion.duration.base }),
      })}
    />
  );

  return (
    <Card
      sx={(theme) => ({
        position: 'sticky',
        // The shell publishes its app bar height; standalone pages stick to the top.
        top: 'var(--rmu-app-bar-height, 0px)',
        zIndex: theme.zIndex.appBar - 1,
        mt: 1,
        bgcolor: compact ? 'background.paper' : 'background.light',
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          duration: theme.motion.duration.base,
        }),
        boxShadow: compact ? 4 : 0,
      })}
    >
      <Stack
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          gap: { xs: 1.5, md: 2.5 },
          px: { xs: 1.5, md: 2.5 },
          py: compact ? 1 : { xs: 1.5, md: 2.5 },
          flexWrap: { xs: 'wrap', lg: 'nowrap' },
          transition: theme.transitions.create('padding', { duration: theme.motion.duration.base }),
        })}
      >
        {onImageClick ? (
          <ButtonBase onClick={onImageClick} aria-label={imageActionLabel} sx={{ borderRadius: 1, flexShrink: 0 }}>
            {avatar}
          </ButtonBase>
        ) : (
          avatar
        )}
        <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
          {overline && !compact && (
            <Typography variant="overline" color="text.secondary" component="div" sx={{ lineHeight: 1.6 }}>
              {overline}
            </Typography>
          )}
          <Typography variant={compact ? 'h6' : 'h4'} component="h1" noWrap>
            {title}
          </Typography>
          {chips && !compact && (
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
              {chips}
            </Stack>
          )}
        </Box>
        {resources && !compact && (
          <Stack spacing={1} sx={{ flex: { xs: '1 1 100%', sm: '1 1 240px', lg: '0 0 280px' }, minWidth: 0 }}>
            {resources}
          </Stack>
        )}
        {pills && (
          <Stack
            direction="row"
            sx={{
              gap: 1,
              flexWrap: 'wrap',
              display: compact ? { xs: 'none', md: 'flex' } : 'flex',
              flex: { xs: '1 1 100%', lg: '0 1 auto' },
            }}
          >
            {pills}
          </Stack>
        )}
        {actions && (
          <Stack direction="row" sx={{ alignItems: 'center', ml: 'auto' }}>
            {actions}
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default HeroHeader;
