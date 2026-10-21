import React, { useState } from 'react';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import ConfirmedRollInput from '../../inputs/ConfirmedRollInput';
import OpenEndedRollInput from '../../inputs/OpenEndedRollInput';
import SidePanelLayout from '../../layouts/SidePanelLayout';
import FlowSteps from '../../ui/FlowSteps';
import ActionStateMarker from './ActionStateMarker';
import ActionTypeChip from './ActionTypeChip';
import ApPips from './ApPips';
import { CombatActionState, combatActionTypes, CombatActionType } from './actionTypes';

// Building blocks of the combat dashboard of spec 005: action type chips, state markers, the side panel
// and the guided flow. Sample data only.

const states: CombatActionState[] = [
  'blocked',
  'unreachable',
  'pending',
  'optimal',
  'held',
  'waiting',
  'resolved',
  'failed',
];

const Catalog = () => (
  <Stack spacing={3}>
    <Box>
      <Typography variant="overline" color="text.secondary">
        Action types
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: 1 }}>
        {(Object.keys(combatActionTypes) as CombatActionType[]).map((type) => (
          <ActionTypeChip key={type} type={type} />
        ))}
      </Stack>
    </Box>
    <Box>
      <Typography variant="overline" color="text.secondary">
        Action states
      </Typography>
      <Stack direction="row" sx={{ gap: 3, mt: 1 }}>
        {states.map((state) => (
          <ActionStateMarker key={state} state={state} text={state === 'resolved' ? '+42' : undefined} />
        ))}
      </Stack>
    </Box>
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="overline" color="text.secondary">
        Action points by phase (surprised 2 with haste 2; then haste 2 with an AP lost in phase 4)
      </Typography>
      <Stack spacing={1} sx={{ mt: 1 }}>
        <ApPips capacity={[0, 0, 2, 2]} ledger={[{ phase: 3, ap: 1, kind: 'spent' }]} currentPhase={3} />
        <ApPips
          capacity={[1, 1, 2, 2]}
          ledger={[
            { phase: 1, ap: 1, kind: 'spent' },
            { phase: 3, ap: 2, kind: 'spent' },
            { phase: 4, ap: 1, kind: 'lost' },
          ]}
          currentPhase={4}
        />
      </Stack>
    </Box>
  </Stack>
);

const actors = ['Aldric Vane', 'Orc warrior 1', 'Orc warrior 2', 'Orc archer'];

const PanelDemo = () => {
  const [open, setOpen] = useState(true);
  const [step, setStep] = useState(1);
  const steps = [
    {
      id: 'targets',
      label: 'Targets',
      summary: 'Orc warrior 2 · DB 25 · AT 9',
      content: <Typography>Target list</Typography>,
    },
    {
      id: 'modifiers',
      label: 'Modifiers',
      summary: '+10 flank · -20 parry',
      content: <Typography color="text.secondary">Spec 003 modifier form</Typography>,
    },
    { id: 'parry', label: 'Parry', summary: '0', content: <Typography>Defender parry</Typography> },
    {
      id: 'roll',
      label: 'Roll',
      summary: '87',
      content: (
        <Stack spacing={2}>
          <OpenEndedRollInput onChange={() => undefined} inputGridSize={5} />
          <ConfirmedRollInput label="Critical roll" value={null} onConfirm={() => undefined} />
        </Stack>
      ),
    },
    { id: 'apply', label: 'Apply', content: <Typography>Result summary</Typography> },
  ];
  return (
    <SidePanelLayout
      open={open}
      onClose={() => setOpen(false)}
      title={
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
            Aldric Vane
          </Typography>
          <ActionTypeChip type="melee_attack" />
        </Stack>
      }
      panel={
        <FlowSteps
          steps={steps}
          activeIndex={step}
          footer={
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
              <Button disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
              <Button variant="contained" onClick={() => setStep((s) => Math.min(s + 1, steps.length))}>
                Next
              </Button>
            </Stack>
          }
        />
      }
    >
      <Stack spacing={1}>
        {actors.map((actor, index) => (
          <Card key={actor}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography sx={{ flex: 1, fontWeight: 600 }}>{actor}</Typography>
              <ActionTypeChip type={index === 0 ? 'melee_attack' : 'movement'} onClick={() => setOpen(true)} />
              <ActionStateMarker state={index === 0 ? 'pending' : 'resolved'} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </SidePanelLayout>
  );
};

const meta = { title: 'Combat/Building blocks', component: Catalog } satisfies Meta<typeof Catalog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TypesAndStates: Story = {};

export const PanelWithFlow: Story = { render: () => <PanelDemo />, parameters: { layout: 'fullscreen' } };
