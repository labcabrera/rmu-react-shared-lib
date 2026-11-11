import { useState } from 'react';
import { Grid } from '@mui/material';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { MarkdownContent } from '../markdown/MarkdownContent';
import { MarkdownEditor } from './MarkdownEditor';

const SAMPLE = `## El vado del norte

La **Guardia del Paso** llegó al vado al caer la tarde. Los *Saqueadores del Páramo* esperaban en la otra orilla.

> Nadie cruza el vado sin pagar. — dicho de la frontera

- Arwyn vigila desde el bosque.
- Bruno cubre el paso.

| Bando | Integrantes |
| ----- | ----------- |
| Guardia del Paso | 2 |
| Saqueadores | 5 |
`;

/** The editor next to what a reader sees, as the chronicle edit page lays them out (workspace spec 102). */
const EditorWithPreview = () => {
  const [markdown, setMarkdown] = useState(SAMPLE);
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 6 }}>
        <MarkdownEditor
          markdown={SAMPLE}
          onChange={setMarkdown}
          onUploadImage={async (file) => `uploads/chronicle/${file.name}`}
          onPickImage={async () => ({ src: 'images/backgrounds/home-1.jpg', alt: 'Mapa' })}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <MarkdownContent markdown={markdown} />
      </Grid>
    </Grid>
  );
};

const meta = {
  title: 'Markdown/Editor',
  component: EditorWithPreview,
} satisfies Meta<typeof EditorWithPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
