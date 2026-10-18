import React, { ReactNode } from 'react';
import { Box, Card, CardContent, Container, Grid, Stack, useMediaQuery, useTheme } from '@mui/material';
import RmuBreadcrumbs from '../breadcrumbs/RmuBreadcrumbs';
import { enterSx } from '../motion/motion';

export default function LayoutBase({
  breadcrumbs,
  actions,
  leftPanel,
  plain = false,
  children,
}: {
  breadcrumbs?: {
    name: string;
    link?: string;
  }[];
  actions?: ReactNode;
  leftPanel?: ReactNode | null;
  /** Content without the surrounding card, for pages that lay out their own cards (dashboards). */
  plain?: boolean;
  children: ReactNode;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const headerSection = (
    <>
      <Card variant="elevation" elevation={0}>
        <CardContent sx={{ py: 0.5, '&:last-child': { pr: 1, pb: 0 } }}>
          <Stack direction={isMobile ? 'column' : 'row'} sx={{ justifyContent: 'space-between' }}>
            {breadcrumbs && <RmuBreadcrumbs items={breadcrumbs} />}
            {actions && (
              <Stack direction="row" sx={{ mb: 0 }}>
                {actions}
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>
    </>
  );

  if (plain) {
    return (
      <Container maxWidth="xl" disableGutters={isMobile}>
        <Box sx={[{ p: 1 }, enterSx()]}>
          {headerSection}
          <Box sx={{ mt: 1 }}>{children}</Box>
        </Box>
      </Container>
    );
  }

  if (isMobile) {
    return (
      <Box sx={[{ p: 1 }, enterSx()]}>
        {headerSection}
        <Card variant="elevation" elevation={0} sx={{ mt: 1 }}>
          <CardContent>
            {leftPanel && <Box sx={{ mb: 1 }}>{leftPanel}</Box>}
            <Box>{children}</Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={[{ p: 1 }, enterSx()]}>
        {headerSection}
        <Card variant="elevation" elevation={0} sx={{ mt: 1 }}>
          <CardContent>
            <Grid container spacing={1}>
              {leftPanel && <Grid size={{ xs: 12, md: 3, lg: 2 }}>{leftPanel}</Grid>}
              <Grid size={leftPanel ? { xs: 12, md: 9, lg: 10 } : { xs: 12 }}>{children}</Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
