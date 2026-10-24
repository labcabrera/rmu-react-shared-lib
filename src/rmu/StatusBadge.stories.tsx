import HealingIcon from '@mui/icons-material/Healing';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { effectIcon } from './EffectList';
import StatusBadge from './StatusBadge';

const meta = {
  title: 'RMU/StatusBadge',
  component: StatusBadge,
  args: {
    status: 'unconscious',
    label: 'Unconscious',
    abbr: 'Unc.',
    detail: 'The character cannot act until they recover.',
    color: 'error',
    avatar: effectIcon('unconscious'),
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    status: 'injuries',
    label: '2 injuries',
    abbr: '2',
    value: -15,
    color: 'warning',
    avatar: undefined,
    icon: <HealingIcon />,
  },
};

export const IconOnly: Story = {
  args: { abbr: '', value: -35, status: 'penalty', label: 'Penalty', color: 'default', avatar: effectIcon('penalty') },
};
