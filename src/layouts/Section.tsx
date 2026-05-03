import React, { ReactNode } from 'react';
import { Card, CardContent, Divider, Typography } from '@mui/material';

export default function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <Card elevation={0.7} sx={{ height: '100%' }}>
      <CardContent>
        {title && (
          <>
            <Typography variant="body1" color="primary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Divider sx={{ mt: 2, mb: 2 }} />
          </>
        )}
        {children}
      </CardContent>
    </Card>
  );
}
