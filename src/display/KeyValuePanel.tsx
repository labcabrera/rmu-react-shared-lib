import React, { FC, ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Panel from '../layouts/Panel';

export interface KeyValueRow {
  label: ReactNode;
  value: ReactNode;
  /** Secondary text under the label (an explanation, the origin of the value…). */
  hint?: string;
}

/** The rows alone: label (and hint) on the left, value on the right, separated by dividers. */
export const KeyValueList: FC<{ rows: KeyValueRow[] }> = ({ rows }) => (
  <Stack component="dl" sx={{ m: 0 }} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
    {rows.map((row, index) => (
      <Stack
        key={index}
        direction="row"
        sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2, py: 0.75 }}
      >
        <Box component="dt" sx={{ minWidth: 0 }}>
          <Typography variant="body2" component="div">
            {row.label}
          </Typography>
          {row.hint && (
            <Typography variant="caption" color="text.secondary" component="div">
              {row.hint}
            </Typography>
          )}
        </Box>
        <Box component="dd" sx={{ m: 0, textAlign: 'right', fontWeight: 700, minWidth: 0 }}>
          <Typography variant="body2" component="div" sx={{ fontWeight: 'inherit' }}>
            {row.value}
          </Typography>
        </Box>
      </Stack>
    ))}
  </Stack>
);

/**
 * Label / value rows (physical data, profile values…). With a `title` the rows go inside a `Panel`; without
 * it they are rendered bare, to be placed inside another container.
 */
const KeyValuePanel: FC<{
  title?: string;
  rows: KeyValueRow[];
  /** Extra controls on the panel title row. */
  extra?: ReactNode;
}> = ({ title, rows, extra }) =>
  title ? (
    <Panel title={title} extra={extra}>
      <KeyValueList rows={rows} />
    </Panel>
  ) : (
    <KeyValueList rows={rows} />
  );

export default KeyValuePanel;
