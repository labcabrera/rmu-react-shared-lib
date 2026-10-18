import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress, Grid, Skeleton, Stack } from '@mui/material';
import { gridSizeCard } from '../../layouts/grid';

/**
 * Placeholder while data loads. `cards` mimics a card list page, `detail` a view page with its side
 * panel; the default is a centered spinner.
 */
const LoadingState: FC<{ variant?: 'spinner' | 'cards' | 'detail'; count?: number }> = ({
  variant = 'spinner',
  count = 8,
}) => {
  const { t } = useTranslation();

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
