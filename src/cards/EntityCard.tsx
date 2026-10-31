import React, { FC, ReactNode, useEffect, useState } from 'react';
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
import { assetCandidates } from '../config/asset-url';
import { hoverLiftSx } from '../motion/motion';

const defaultImage = 'images/generic/configuration.png';

/** Width of the image of the horizontal card on phones (spec 058, decision 4). */
const phoneImageSize = 96;

export interface EntityMetric {
  label: string;
  value: ReactNode;
}

/**
 * Card of an entity in every list (realms, races, characters, NPCs, items…): a square image, the name in the display
 * font, chips, a few metrics and a short description. The image has the same shape everywhere (spec 058): what each
 * list shows below it may differ. On phones the card is horizontal, the image (96 px) on the left of the text.
 */
const EntityCard: FC<{
  title: string;
  subtitle?: ReactNode;
  image?: string | null;
  /** Images tried in order when `image` fails to load (for example an item's category image, then a generic one). */
  fallbackImages?: string[];
  /** A compact card without image (key numbers, skills). */
  noImage?: boolean;
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
  noImage = false,
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
  // Thumbnail of base images first (512 px wide, spec 058), then the original, the fallbacks and a generic image.
  const sources = assetCandidates([image, ...fallbackImages, defaultImage], 512);
  const key = sources.join('|');
  useEffect(() => setFailed(0), [key]);
  const source = sources[Math.min(failed, sources.length - 1)];
  const lockBadge = locked && (
    <Tooltip title={lockedLabel ?? ''}>
      <LockIcon
        fontSize="small"
        aria-label={lockedLabel}
        sx={
          noImage
            ? { flex: 'none', color: 'text.secondary' }
            : {
                position: 'absolute',
                top: { xs: 4, sm: 8 },
                right: { xs: 4, sm: 8 },
                p: 0.5,
                borderRadius: '50%',
                bgcolor: 'background.paper',
              }
        }
      />
    </Tooltip>
  );
  const content = (
    <Box
      sx={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: noImage ? 'column' : { xs: 'row', sm: 'column' },
        alignItems: 'stretch',
      }}
    >
      {!noImage && (
        <Box
          sx={{
            position: 'relative',
            flex: 'none',
            width: { xs: phoneImageSize, sm: '100%' },
            alignSelf: 'flex-start',
          }}
        >
          <CardMedia
            component="img"
            image={source}
            alt=""
            onError={() => failed < sources.length - 1 && setFailed(failed + 1)}
            sx={{
              aspectRatio: '1',
              objectFit: 'cover',
              objectPosition: 'center',
              filter: imageFilter,
              viewTransitionName: imageTransitionName,
            }}
          />
          {lockBadge}
        </Box>
      )}
      <CardContent
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          ...(!noImage && { p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: { xs: 1.5, sm: 2 } } }),
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={(theme) => ({
                fontFamily: theme.fonts.display,
                flex: 1,
                minWidth: 0,
                [theme.breakpoints.down('sm')]: { fontSize: theme.typography.subtitle1.fontSize },
              })}
              noWrap
            >
              {title}
            </Typography>
            {noImage && lockBadge}
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
    </Box>
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
