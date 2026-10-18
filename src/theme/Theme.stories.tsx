import React from 'react';
import { Box, Grid, Typography, useTheme } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';

// Palette of the active theme (switch light/dark in the toolbar).
const Palette = () => {
  const { palette } = useTheme();
  const swatches: [string, string][] = [
    ['primary.main', palette.primary.main],
    ['secondary.main', palette.secondary.main],
    ['background.default', palette.background.default],
    ['background.paper', palette.background.paper],
    ['background.light', palette.background.light],
    ['text.primary', palette.text.primary],
    ['text.secondary', palette.text.secondary],
    ['divider', palette.divider],
    ['success.main', palette.success.main],
    ['error.main', palette.error.main],
    ['warning.main', palette.warning.main],
    ['info.main', palette.info.main],
  ];
  return (
    <Grid container spacing={2}>
      {swatches.map(([name, color]) => (
        <Grid key={name} size={{ xs: 6, sm: 4, md: 3 }}>
          <Box sx={{ height: 56, borderRadius: 1, border: 1, borderColor: 'divider', backgroundColor: color }} />
          <Typography variant="body2">{name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {color}
          </Typography>
        </Grid>
      ))}
    </Grid>
  );
};

const meta = { title: 'Theme/Palette', component: Palette } satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {};
