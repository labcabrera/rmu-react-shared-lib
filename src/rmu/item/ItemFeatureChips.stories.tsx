import type { Meta, StoryObj } from '@storybook/react-vite';
import ItemFeatureChips from './ItemFeatureChips';

const meta: Meta<typeof ItemFeatureChips> = {
  title: 'RMU/Item/ItemFeatureChips',
  component: ItemFeatureChips,
};

export default meta;
type Story = StoryObj<typeof ItemFeatureChips>;

// Invented values: the book data only lives in the catalog
export const Container: Story = {
  args: { item: { lotSize: 10, features: { container: { weight: 30, volume: 2, liquid: null, units: null } } } },
};
export const Light: Story = { args: { item: { features: { light: { radius: 15, durationHours: 4 } } } } };
export const Mount: Story = { args: { item: { features: { transport: { capacity: 300, speed: 40 } } } } };
export const Ammunition: Story = {
  args: { item: { lotSize: 12, features: { ammunition: { launchers: ['sling'], sizeAdjustment: 1 } } } },
};
export const FullSuit: Story = { args: { item: { armor: { coverage: ['body', 'head', 'arms', 'legs'] } } } };
export const ImprovisedWeapon: Story = { args: { item: { weapon: { modes: [{ obModifier: -25 }] } } } };
export const Poison: Story = {
  args: {
    item: {
      features: {
        poison: {
          category: 'muscle',
          level: 4,
          form: 'paste',
          maxSeverity: 'severe',
          immediateHits: null,
          onsetRounds: null,
        },
      },
    },
  },
};
export const Antidote: Story = {
  args: { item: { features: { antidote: { categories: ['muscle', 'nerve'], level: 6, withinHours: 2 } } } },
};
export const AsText: Story = {
  args: { item: { lotSize: 6, features: { light: { radius: 5, durationHours: 1 } } }, variant: 'text' },
};
