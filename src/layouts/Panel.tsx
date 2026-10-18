import React, { FC, ReactNode } from 'react';
import { Box, Button, Card, CardContent, Stack, SxProps, Theme, Typography } from '@mui/material';

/**
 * Dashboard card: a small uppercase title, an optional link to the full section, and its content.
 * Lighter than Section, for grids of cards that share one page.
 */
const Panel: FC<{
  title: string;
  /** Label and handler of the link to the full view ("See all"). */
  action?: { label: string; onClick: () => void };
  /** Extra controls on the title row. */
  extra?: ReactNode;
  children: ReactNode;
  sx?: SxProps<Theme>;
}> = ({ title, action, extra, children, sx }) => (
  <Card sx={[{ height: '100%', display: 'flex', flexDirection: 'column' }, ...(Array.isArray(sx) ? sx : [sx])]}>
    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: 32, gap: 1 }}>
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }} noWrap>
          {title}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {extra}
          {action && (
            <Button size="small" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </Stack>
      </Stack>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </CardContent>
  </Card>
);

export default Panel;
