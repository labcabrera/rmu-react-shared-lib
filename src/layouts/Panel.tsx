import React, { FC, ReactNode } from 'react';
import { Box, Button, Card, CardContent, Stack, SxProps, Theme, Typography } from '@mui/material';

export type PanelVariant = 'card' | 'outlined';

/**
 * Dashboard card or sub-block: a small uppercase title, an optional link to the full section, and its content
 * (spec 066, decision 3). `card` is a tile of a page grid; `outlined` is a bordered block without background, for a
 * part of a section, a dialog or a wizard step. Lighter than Section, which is the block of a page.
 */
const Panel: FC<{
  title?: string;
  /** Label and handler of the link to the full view ("See all"). */
  action?: { label: string; onClick: () => void };
  /** Extra controls on the title row. */
  extra?: ReactNode;
  variant?: PanelVariant;
  /** Smaller paddings and gaps, for panels inside dialogs and dense views. */
  dense?: boolean;
  children: ReactNode;
  sx?: SxProps<Theme>;
}> = ({ title, action, extra, variant = 'card', dense = false, children, sx }) => {
  const outlined = variant === 'outlined';
  const header = (title || extra || action) && (
    <Stack
      direction="row"
      sx={{ alignItems: 'center', justifyContent: 'space-between', minHeight: dense ? 24 : 32, gap: 1 }}
    >
      {title ? (
        <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }} noWrap>
          {title}
        </Typography>
      ) : (
        <span />
      )}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        {extra}
        {action && (
          <Button size="small" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </Stack>
    </Stack>
  );
  return (
    <Card
      variant={outlined ? 'outlined' : undefined}
      sx={[
        { display: 'flex', flexDirection: 'column' },
        outlined ? { bgcolor: 'transparent', backgroundImage: 'none' } : { height: '100%' },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: dense ? 1 : 1.5,
          p: dense || outlined ? 1.5 : 2,
          '&:last-child': { pb: dense || outlined ? 1.5 : 2 },
        }}
      >
        {header}
        <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
      </CardContent>
    </Card>
  );
};

export default Panel;
