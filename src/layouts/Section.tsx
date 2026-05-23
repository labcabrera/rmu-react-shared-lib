import React, { ReactNode } from 'react';
import { Box, Card, CardContent, Divider, Typography } from '@mui/material';

export default function Section({
  title,
  actions,
  children,
}: {
  title?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card elevation={0.7} sx={{ height: '100%' }}>
      <CardContent>
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
        <pre>{actions}</pre>
      </CardContent>
    </Card>
  );
}
