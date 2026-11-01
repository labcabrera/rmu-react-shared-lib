import React, { FC, ReactNode } from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';

/**
 * A centred message that replaces a page (sign-in required, forbidden, a remote that did not load), spec 066:
 * title, text and an action.
 */
const MessageScreen: FC<{ title: string; text?: ReactNode; action?: ReactNode; icon?: ReactNode }> = ({
  title,
  text,
  action,
  icon,
}) => (
  <Box sx={{ display: 'grid', minHeight: 320, placeItems: 'center', px: 2 }}>
    <Paper variant="outlined" sx={{ maxWidth: 420, width: '100%', p: 3, textAlign: 'center' }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        {icon}
        <Typography variant="h5" component="h1">
          {title}
        </Typography>
        {text && <Typography color="text.secondary">{text}</Typography>}
        {action}
      </Stack>
    </Paper>
  </Box>
);

export default MessageScreen;
