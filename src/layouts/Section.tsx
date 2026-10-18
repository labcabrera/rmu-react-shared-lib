import React, { ReactNode } from 'react';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';

export default function Section({
  title,
  actions,
  elevation,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  elevation?: number;
  children: ReactNode;
}) {
  return (
    <Card
      elevation={elevation ?? 0}
      sx={{
        height: '100%',
        // Former default elevation 0.7 (not a valid MUI elevation): no shadow and a 2.5% overlay in dark mode.
        ...(elevation === undefined && {
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(rgba(255, 255, 255, 0.025), rgba(255, 255, 255, 0.025))'
              : 'none',
        }),
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 1 }, pb: 1 }}>
        {title && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {actions && <Box sx={{ ml: 2 }}>{actions}</Box>}
            </Box>
            <Divider sx={{ mt: 2, mb: 2 }} />
          </>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
