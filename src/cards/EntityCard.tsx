import React, { FC, ReactNode } from 'react';
import LockIcon from '@mui/icons-material/Lock';
import { Box, Card, CardActionArea, CardContent, CardMedia, Stack, Tooltip, Typography } from '@mui/material';
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
  /** Image shape: `wide` (16:9, default), `portrait` (3:4, for people and creatures) or `square`. */
  imageRatio?: keyof typeof ratios;
  /** CSS filter for the image (for example the sepia filter of the item illustrations). */
  imageFilter?: string;
  chips?: ReactNode;
  metrics?: EntityMetric[];
  description?: string;
  /** Shows a lock badge (private entities). */
  locked?: boolean;
  lockedLabel?: string;
  /** `view-transition-name` of the image, to morph into the detail page header. */
  imageTransitionName?: string;
  onClick?: () => void;
}> = ({
  title,
  subtitle,
  image,
  imageRatio = 'wide',
  imageFilter,
  chips,
  metrics,
  description,
  locked = false,
  lockedLabel,
  imageTransitionName,
  onClick,
}) => {
  const content = (
    <>
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          image={resolveAssetUrl(image || defaultImage)}
          alt=""
          sx={{
            aspectRatio: ratios[imageRatio],
            objectFit: 'cover',
            filter: imageFilter,
            viewTransitionName: imageTransitionName,
          }}
        />
        {locked && (
          <Tooltip title={lockedLabel ?? ''}>
            <LockIcon
              fontSize="small"
              aria-label={lockedLabel}
              sx={{ position: 'absolute', top: 8, right: 8, p: 0.5, borderRadius: '50%', bgcolor: 'background.paper' }}
            />
          </Tooltip>
        )}
      </Box>
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="h3" sx={{ fontFamily: (theme) => theme.fonts.display }} noWrap>
            {title}
          </Typography>
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
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
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
    <Card sx={[{ height: '100%', display: 'flex', flexDirection: 'column' }, Boolean(onClick) && hoverLiftSx]}>
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
    </Card>
  );
};

export default EntityCard;
