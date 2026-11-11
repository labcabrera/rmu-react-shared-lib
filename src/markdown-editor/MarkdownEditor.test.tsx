import { createRef } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MarkdownEditor, MarkdownEditorMethods } from './MarkdownEditor';
import { readEditorMode, storeEditorMode } from './editor-mode';

const SAMPLE = [
  '# La frontera del norte',
  '',
  '## El vado',
  '',
  'Texto con **negrita**, *cursiva*, ~~tachado~~ y `código`.',
  '',
  '> Una cita del cronista.',
  '',
  '* uno',
  '* dos',
  '',
  '1. primero',
  '2. segundo',
  '',
  '[enlace](https://example.com)',
  '',
  '![Mapa del vado](uploads/chronicle/a.webp)',
  '',
  '| Bando | Bajas |',
  '| ----- | ----- |',
  '| Guardia | 1 |',
  '',
  '***',
].join('\n');

/** The text a reader sees: the Markdown without the marks that only change how it is written. */
const visible = (markdown: string) => markdown.replace(/[\s*_-]+/g, ' ').trim();

describe('MarkdownEditor (workspace spec 102)', () => {
  beforeEach(() => localStorage.clear());

  it('keeps what a reader sees after loading and reading back every mark of the toolbar', async () => {
    const ref = createRef<MarkdownEditorMethods>();
    render(<MarkdownEditor ref={ref} markdown={SAMPLE} onChange={vi.fn()} />);
    await waitFor(() => expect(ref.current?.getMarkdown()).toBeTruthy());
    const out = ref.current!.getMarkdown();
    expect(visible(out)).toBe(visible(SAMPLE));
    expect(out).toContain('![Mapa del vado](uploads/chronicle/a.webp)');
    expect(out).not.toMatch(/<u>|<\w+[^>]*>/);
  });

  it('shows the toggle between the visual and the Markdown modes', async () => {
    render(<MarkdownEditor markdown="hola" onChange={vi.fn()} />);
    expect(await screen.findByText('hola')).toBeTruthy();
    expect(screen.getByRole('radio', { name: /rich text/i })).toBeTruthy();
    expect(screen.getByRole('radio', { name: /source/i })).toBeTruthy();
  });

  it('remembers the mode, visual by default', () => {
    expect(readEditorMode()).toBe('rich-text');
    storeEditorMode('source');
    expect(readEditorMode()).toBe('source');
  });
});
