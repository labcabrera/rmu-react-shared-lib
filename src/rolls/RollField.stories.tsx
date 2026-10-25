import React, { useState } from 'react';
import { Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import RmuDialog from '../dialogs/RmuDialog';
import { D10, D100, HIGH_OPEN_D100, LOW_OPEN_D100, OPEN_D100, TWO_D10 } from './presets';
import RollField, { RollFieldProps } from './RollField';
import { RollValue } from './roll.types';

/** Keeps the value like a screen does, so the field shows what was confirmed. */
const Stateful = (props: Omit<RollFieldProps, 'value' | 'onChange'> & { value?: RollFieldProps['value'] }) => {
  const [value, setValue] = useState<RollFieldProps['value']>(props.value ?? null);
  const [last, setLast] = useState<RollValue>();
  return (
    <Stack spacing={1} sx={{ maxWidth: 320 }}>
      <RollField
        {...props}
        value={value}
        onChange={(roll) => {
          setValue(roll);
          setLast(roll);
        }}
      />
      {last && (
        <Typography variant="caption" color="text.secondary">
          {JSON.stringify(last)}
        </Typography>
      )}
    </Stack>
  );
};

const meta = {
  title: 'Rolls/RollField',
  component: RollField,
  args: { spec: OPEN_D100, value: null, onChange: fn(), label: 'Attack roll' },
  render: (args) => <Stateful {...args} />,
} satisfies Meta<typeof RollField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenEnded: Story = {};

export const OpenEndedHighOnly: Story = { args: { spec: HIGH_OPEN_D100 } };

export const OpenEndedLowOnly: Story = { args: { spec: LOW_OPEN_D100 } };

export const Closed: Story = { args: { spec: D100, label: 'Critical roll' } };

export const SingleD10: Story = { args: { spec: D10, label: 'd10' } };

export const TwoD10: Story = { args: { spec: TWO_D10, label: 'Initiative' } };

export const StoredTotal: Story = { args: { value: 142 } };

export const Disabled: Story = { args: { value: 87, disabled: true } };

export const WithError: Story = { args: { error: true, helperText: 'Required' } };

/** The keypad as it opens on tablets and phones. */
export const BottomSheet: Story = { args: { presentation: 'sheet' } };

export const InsideDialog: Story = {
  render: (args) => (
    <RmuDialog open title="Resolve attack" maxWidth="sm" onCancel={fn()} onConfirm={fn()}>
      <Stateful {...args} />
    </RmuDialog>
  ),
};

export const CompactInTable: Story = {
  render: () => (
    <Table size="small" sx={{ maxWidth: 480 }}>
      <TableHead>
        <TableRow>
          <TableCell>Actor</TableCell>
          <TableCell>Initiative</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {['Kaelith', 'Doran'].map((name) => (
          <TableRow key={name}>
            <TableCell>{name}</TableCell>
            <TableCell sx={{ width: 180 }}>
              <Stateful spec={TWO_D10} label="2d10" compact />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
