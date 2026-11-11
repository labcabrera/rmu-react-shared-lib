import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Grid,
  LinearProgress,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  ThemeProvider,
  Typography,
  useTheme,
} from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { createAppTheme, ThemeMode } from './createAppTheme';
import { themePresetNames } from './presets';

// Palette of the active theme (switch preset, mode and density in the toolbar).
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
    ...Object.entries(palette.resource).map(([key, color]): [string, string] => [`resource.${key}`, color]),
    ...Object.entries(palette.rarity).map(([key, color]): [string, string] => [`rarity.${key}`, color]),
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

const Resource = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => (
  <Box>
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {value} / {max}
      </Typography>
    </Stack>
    <LinearProgress
      variant="determinate"
      value={(value / max) * 100}
      sx={{ bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: color } }}
    />
  </Box>
);

// A sample of the components that carry the look: headings, buttons, chips, cards, tabs, a table, inputs.
const Sampler = () => {
  const { palette } = useTheme();
  const [tab, setTab] = useState(0);
  const stats = [
    ['Agility', 62, 71, 4],
    ['Constitution', 88, 90, 9],
    ['Empathy', 35, 52, -3],
  ] as const;
  return (
    <Stack spacing={2} sx={{ p: 2, bgcolor: 'background.default', color: 'text.primary' }}>
      <Box>
        <Typography variant="overline" color="text.secondary">
          Level 7 · Fighter
        </Typography>
        <Typography variant="h4">Shaktur the Grey</Typography>
      </Box>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Chip label="Black Numenorean" />
        <Chip label="Channeling" color="primary" variant="outlined" />
        <Chip label="Rare" sx={{ color: palette.rarity.rare, borderColor: palette.rarity.rare }} variant="outlined" />
      </Stack>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Resource label="Hit points" value={64} max={86} color={palette.resource.hp} />
            <Resource label="Power points" value={12} max={30} color={palette.resource.pp} />
            <Resource label="Experience" value={30000} max={40000} color={palette.resource.xp} />
          </Stack>
        </CardContent>
      </Card>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Overview" />
        <Tab label="Skills" />
        <Tab label="Combat" />
      </Tabs>
      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Stat</TableCell>
              <TableCell align="right">Temp</TableCell>
              <TableCell align="right">Pot</TableCell>
              <TableCell align="right">Bonus</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.map(([name, temp, pot, bonus]) => (
              <TableRow key={name} hover>
                <TableCell>{name}</TableCell>
                <TableCell align="right">{temp}</TableCell>
                <TableCell align="right">{pot}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: bonus < 0 ? 'stat.negative' : 'stat.positive' }}>
                  {bonus > 0 ? `+${bonus}` : bonus}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <TextField label="Search skills" />
      <Stack direction="row" spacing={1}>
        <Button variant="contained">Level up</Button>
        <Button variant="outlined">Edit</Button>
        <Button>Cancel</Button>
      </Stack>
      <Alert severity="info">2 stat updates available</Alert>
    </Stack>
  );
};

// Every preset next to each other in the chosen mode, to compare directions.
const Comparison = ({ mode }: { mode: ThemeMode }) => (
  <Grid container spacing={2}>
    {themePresetNames.map((preset) => (
      <Grid key={preset} size={{ xs: 12, md: 6, xl: 3 }}>
        <ThemeProvider theme={createAppTheme({ preset, mode })}>
          <CssBaseline enableColorScheme />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {preset}
          </Typography>
          <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
            <Sampler />
          </Box>
        </ThemeProvider>
      </Grid>
    ))}
  </Grid>
);

const meta = { title: 'Theme/Gallery', component: Palette } satisfies Meta<typeof Palette>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {};

export const Components: Story = { render: () => <Sampler /> };

export const PresetsDark: Story = { render: () => <Comparison mode="dark" />, parameters: { layout: 'fullscreen' } };

export const PresetsLight: Story = { render: () => <Comparison mode="light" />, parameters: { layout: 'fullscreen' } };
