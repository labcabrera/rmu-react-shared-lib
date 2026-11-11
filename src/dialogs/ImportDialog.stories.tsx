import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { ImportPreview } from '../api/character-export.dto';
import {
  characterPreview,
  errorsPreview,
  factionFilePreview,
  importResult,
  migratedPreview,
  warningsPreview,
} from '../test/fixtures/import';
import ImportDialog from './ImportDialog';

const previewWith = (preview: ImportPreview) => async () => preview;

const meta = {
  title: 'Dialogs/ImportDialog',
  component: ImportDialog,
  args: {
    open: true,
    title: 'Import character',
    subtitle: 'Wanderers',
    onPreview: previewWith(characterPreview),
    onImport: async () => importResult,
    onImported: fn(),
    onClose: fn(),
  },
  parameters: {
    docs: { description: { component: 'Choose any JSON file: the preview comes from the story, not from the API.' } },
  },
} satisfies Meta<typeof ImportDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CurrentVersion: Story = {};

export const Migrated: Story = { args: { onPreview: previewWith(migratedPreview) } };

export const WithWarnings: Story = { args: { onPreview: previewWith(warningsPreview) } };

export const WithErrors: Story = { args: { onPreview: previewWith(errorsPreview) } };

export const FactionFile: Story = {
  args: {
    onPreview: async ({ characterRef }) =>
      characterRef ? { ...factionFilePreview, characterRef, errors: [] } : factionFilePreview,
  },
};
