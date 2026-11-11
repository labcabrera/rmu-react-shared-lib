import React, { FC, ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import Panel from '../layouts/Panel';

/**
 * Colour of a value (spec 066, decision 5): `penalty` paints a negative number red and dims a zero; `danger` and
 * `success` always paint it.
 */
export type KeyValueTone = 'default' | 'penalty' | 'danger' | 'success';

export interface KeyValueRow {
  label: ReactNode;
  value: ReactNode;
  /** Secondary text under the label (an explanation, the origin of the value…). */
  hint?: string;
  tone?: KeyValueTone;
}

/** The colour of a value for its tone. */
export const keyValueColor = (value: ReactNode, tone: KeyValueTone = 'default'): string => {
  if (tone === 'danger') return 'error.main';
  if (tone === 'success') return 'success.main';
  if (tone === 'penalty' && typeof value === 'number') {
    if (value < 0) return 'error.main';
    if (value === 0) return 'text.disabled';
  }
  return 'text.primary';
};

/** One label / value row: label (and hint) on the left, value on the right. */
export const KeyValueLine: FC<KeyValueRow & { dense?: boolean }> = ({ label, value, hint, tone, dense }) => (
  <Stack
    direction="row"
    sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: dense ? 0.5 : 0.75 }}
  >
    <Box component="dt" sx={{ minWidth: 0 }}>
      <Typography variant="body2" component="div" color={dense ? 'text.secondary' : undefined}>
        {label}
      </Typography>
      {hint && (
        <Typography variant="caption" color="text.secondary" component="div">
          {hint}
        </Typography>
      )}
    </Box>
    <Box component="dd" sx={{ m: 0, textAlign: 'right', minWidth: 0, flexShrink: 0 }}>
      <Typography
        variant="body2"
        component="div"
        sx={{ fontWeight: 600, whiteSpace: 'nowrap', color: keyValueColor(value, tone) }}
      >
        {value}
      </Typography>
    </Box>
  </Stack>
);

/** The rows alone, separated by dividers. `dense` uses tighter rows with the labels in the secondary colour. */
export const KeyValueList: FC<{ rows: KeyValueRow[]; dense?: boolean }> = ({ rows, dense }) => (
  <Stack component="dl" sx={{ m: 0 }} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
    {rows.map((row, index) => (
      <KeyValueLine key={index} {...row} dense={dense} />
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
  dense?: boolean;
}> = ({ title, rows, extra, dense }) =>
  title ? (
    <Panel title={title} extra={extra}>
      <KeyValueList rows={rows} dense={dense} />
    </Panel>
  ) : (
    <KeyValueList rows={rows} dense={dense} />
  );

export default KeyValuePanel;
