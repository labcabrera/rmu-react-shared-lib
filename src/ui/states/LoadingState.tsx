import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Card, CardContent, CircularProgress, Grid, Skeleton, Stack } from '@mui/material';
import { gridSizeCard } from '../../layouts/grid';

const showcaseRatios = { wide: '16 / 9', portrait: '3 / 4', square: '1 / 1' } as const;
const showcaseSize = { xs: 12, sm: 6, md: 4, lg: 3 };

/**
 * Placeholder while data loads. `cards` mimics a card list page, `showcase` a grid of EntityCard (image, title,
 * subtitle, chips and metrics; `imageRatio` as the cards), `detail` a view page with its side panel; the default is a
 * centered spinner.
 */
const LoadingState: FC<{
  variant?: 'spinner' | 'cards' | 'showcase' | 'detail';
  count?: number;
  /** Image shape of the `showcase` cards. */
  imageRatio?: keyof typeof showcaseRatios;
  /** Grid sizes of the `showcase` cards (gridSizeShowcase by default). */
  cardSize?: Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;
}> = ({ variant = 'spinner', count = 8, imageRatio = 'wide', cardSize = showcaseSize }) => {
  const { t } = useTranslation();

  if (variant === 'showcase') {
    return (
      <Grid container spacing={1} aria-busy="true" aria-label={t('loading')}>
        {Array.from({ length: count }, (_, index) => (
          <Grid key={index} size={cardSize}>
            <Card sx={{ height: '100%' }}>
              <Skeleton
                variant="rectangular"
                sx={{ width: '100%', height: 'auto', aspectRatio: showcaseRatios[imageRatio] }}
              />
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box>
                  <Skeleton variant="text" width="70%" sx={{ fontSize: '1.25rem' }} />
                  <Skeleton variant="text" width="45%" />
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <Skeleton variant="rounded" width={56} height={24} />
                  <Skeleton variant="rounded" width={72} height={24} />
                </Stack>
                <Stack direction="row" spacing={2}>
                  {[0, 1, 2].map((metric) => (
                    <Box key={metric}>
                      <Skeleton variant="text" width={32} />
                      <Skeleton variant="text" width={48} />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'cards') {
    return (
      <Grid container spacing={1} aria-busy="true" aria-label={t('loading')}>
        {Array.from({ length: count }, (_, index) => (
          <Grid key={index} size={gridSizeCard}>
            <Skeleton variant="rounded" height={70} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (variant === 'detail') {
    return (
      <Grid container spacing={2} aria-busy="true" aria-label={t('loading')}>
        <Grid size={{ xs: 12, md: 3, lg: 2 }}>
          <Skeleton variant="rounded" sx={{ width: '100%', aspectRatio: '1' }} />
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </Grid>
        <Grid size={{ xs: 12, md: 9, lg: 10 }}>
          <Stack spacing={1}>
            <Skeleton variant="rounded" height={48} />
            <Skeleton variant="rounded" height={160} />
            <Skeleton variant="rounded" height={160} />
          </Stack>
        </Grid>
      </Grid>
    );
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
      <CircularProgress aria-label={t('loading')} />
    </Box>
  );
};

export default LoadingState;
