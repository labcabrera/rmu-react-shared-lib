import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import OptionsHelpDialog from './OptionsHelpDialog';

const meta = {
  title: 'UI/OptionsHelpDialog',
  component: OptionsHelpDialog,
  args: {
    open: true,
    title: 'Settings',
    onClose: fn(),
    options: [
      { key: 'xp', label: 'Experience multiplier', value: '×2', defaultValue: 1, description: 'Scales the experience.' },
      { key: 'fatigue', label: 'Fatigue multiplier', value: '×1', defaultValue: 1, description: 'Scales fatigue.' },
      { key: 'open', label: 'Open rounds', value: 'Yes', defaultValue: 'No', description: 'Actions are declared in turn.' },
    ],
  },
} satisfies Meta<typeof OptionsHelpDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
