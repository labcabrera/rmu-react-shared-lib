import React, { FC, ReactNode, useState } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  CardMedia,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';
import { hoverLiftSx } from '../motion/motion';

const defaultImage = 'images/generic/configuration.png';

const ratios = { wide: '16 / 9', portrait: '3 / 4', square: '1 / 1' } as const;

export interface EntityMetric {
  label: string;
  value: ReactNode;
}

/**
 * Showcase card for catalogs with few entries (realms, races, professions, games…): a large image,
 * the name in the display font, chips, a few metrics and a short description.
 */
const EntityCard: FC<{
  title: string;
  subtitle?: ReactNode;
  image?: string | null;
  /** Images tried in order when `image` fails to load (for example an item's category image, then a generic one). */
  fallbackImages?: string[];
  /**
   * Image shape: `wide` (16:9, default), `portrait` (3:4, for people and creatures), `square`, or `none` for a
   * compact card without media (for example skills).
   */
  imageRatio?: keyof typeof ratios | 'none';
  /** CSS filter for the image (for example the sepia filter of the item illustrations). */
  imageFilter?: string;
  chips?: ReactNode;
  metrics?: EntityMetric[];
  description?: string;
  /** Lines of the description before it is clamped (default 2). */
  descriptionLines?: number;
  /** Shows a lock badge (private entities). */
  locked?: boolean;
  lockedLabel?: string;
  /** `view-transition-name` of the image, to morph into the detail page header. */
  imageTransitionName?: string;
  onClick?: () => void;
  /** Buttons below the card, outside its clickable area (buy, craft…). */
  actions?: ReactNode;
  /** Highlighted border (the chosen one of a list). */
  selected?: boolean;
}> = ({
  title,
  subtitle,
  image,
  imageRatio = 'wide',
  imageFilter,
  chips,
  metrics,
  description,
  descriptionLines = 2,
  locked = false,
  lockedLabel,
  imageTransitionName,
  onClick,
  fallbackImages = [],
  actions,
  selected = false,
}) => {
  const [failed, setFailed] = useState(0);
  const sources = [image || defaultImage, ...fallbackImages];
  const source = sources[Math.min(failed, sources.length - 1)];
  const lockBadge = locked && (
    <Tooltip title={lockedLabel ?? ''}>
      <LockIcon
        fontSize="small"
        aria-label={lockedLabel}
        sx={
          imageRatio === 'none'
            ? { flex: 'none', color: 'text.secondary' }
            : { position: 'absolute', top: 8, right: 8, p: 0.5, borderRadius: '50%', bgcolor: 'background.paper' }
        }
      />
    </Tooltip>
  );
  const content = (
    <>
      {imageRatio !== 'none' && (
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            image={resolveAssetUrl(source)}
            alt=""
            onError={() => failed < sources.length - 1 && setFailed(failed + 1)}
            sx={{
              aspectRatio: ratios[imageRatio],
              objectFit: 'cover',
              filter: imageFilter,
              viewTransitionName: imageTransitionName,
            }}
          />
          {lockBadge}
        </Box>
      )}
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontFamily: (theme) => theme.fonts.display, flex: 1, minWidth: 0 }}
              noWrap
            >
              {title}
            </Typography>
            {imageRatio === 'none' && lockBadge}
          </Stack>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" noWrap>
              {subtitle}
            </Typography>
          )}
        </Box>
        {chips && (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {chips}
          </Stack>
        )}
        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: descriptionLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </Typography>
        )}
        {metrics && metrics.length > 0 && (
          <Stack direction="row" sx={{ gap: 2, mt: 'auto', pt: 0.5, flexWrap: 'wrap' }}>
            {metrics.map((metric) => (
              <Box key={metric.label}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {metric.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {metric.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        )}
      </CardContent>
    </>
  );

  return (
    <Card
      sx={[
        { height: '100%', display: 'flex', flexDirection: 'column' },
        selected && { outline: 2, outlineColor: 'primary.main', outlineOffset: -2 },
        Boolean(onClick) && hoverLiftSx,
      ]}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            justifyContent: 'flex-start',
          }}
        >
          {content}
        </CardActionArea>
      ) : (
        content
      )}
      {actions && <CardActions sx={{ pt: 0, flexWrap: 'wrap', gap: 0.5 }}>{actions}</CardActions>}
    </Card>
  );
};

export default EntityCard;
