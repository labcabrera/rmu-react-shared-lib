import React, { ReactNode } from 'react';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';

export default function Section({
  title,
  actions,
  elevation = 0.7,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  elevation?: number;
  children: ReactNode;
}) {
  return (
    <Card elevation={elevation} sx={{ height: '100%' }}>
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
