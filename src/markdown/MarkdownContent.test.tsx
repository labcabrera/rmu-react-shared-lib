import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from './MarkdownContent';
import { extractHeadings, slugify } from './markdown-headings';
import { isEmbeddableImage } from './markdown-urls';

const show = (markdown: string) =>
  render(
    <MemoryRouter>
      <MarkdownContent markdown={markdown} />
    </MemoryRouter>
  );

describe('MarkdownContent (workspace spec 102)', () => {
  it('renders GitHub Flavored Markdown with heading anchors', () => {
    show('## El vado {#ford}\n\n**negrita** y ~~tachado~~\n\n| a | b |\n|---|---|\n| 1 | 2 |');
    expect(screen.getByRole('heading', { name: 'El vado' }).id).toBe('ford');
    expect(screen.getByText('negrita').tagName).toBe('STRONG');
    expect(screen.getByText('tachado').tagName).toBe('DEL');
    expect(screen.getByRole('table')).toBeTruthy();
  });

  it('never renders raw HTML', () => {
    const { container } = show('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">\n\ntexto');
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('texto')).toBeTruthy();
  });

  it('shows uploads and leaves out external images, keeping their text', () => {
    const { container } = show('![Mapa](uploads/chronicle/a.webp)\n\n![Fuera](https://example.com/x.png)');
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(1);
    expect(images[0].getAttribute('src')).toContain('uploads/chronicle/a.webp');
    expect(screen.getByText('Fuera')).toBeTruthy();
  });

  it('stretches the images to the text width only when asked', () => {
    const md = '![Mapa](uploads/chronicle/a.webp)';
    const natural = render(
      <MemoryRouter>
        <MarkdownContent markdown={md} />
      </MemoryRouter>
    );
    expect(getComputedStyle(natural.container.querySelector('img')!).width).not.toBe('100%');
    natural.unmount();
    const full = render(
      <MemoryRouter>
        <MarkdownContent markdown={md} fullWidthImages />
      </MemoryRouter>
    );
    expect(getComputedStyle(full.container.querySelector('img')!).width).toBe('100%');
  });

  it('opens external links in a new tab and drops javascript: URLs', () => {
    show('[web](https://example.com) [mal](javascript:alert(1))');
    expect(screen.getByText('web').closest('a')?.getAttribute('target')).toBe('_blank');
    expect(screen.getByText('mal').closest('a')?.getAttribute('href') ?? '').not.toContain('javascript');
  });
});

describe('markdown helpers', () => {
  it('slugifies and extracts the second-level headings outside code', () => {
    expect(slugify('Cómo está organizada')).toBe('como-esta-organizada');
    expect(extractHeadings('## Uno\n```\n## no\n```\n## Dos {#two}\n### tres')).toEqual([
      { text: 'Uno', id: 'uno' },
      { text: 'Dos', id: 'two' },
    ]);
  });

  it('only embeds app images', () => {
    expect(isEmbeddableImage('uploads/chronicle/a.png')).toBe(true);
    expect(isEmbeddableImage('images/races/elf.png')).toBe(true);
    expect(isEmbeddableImage('https://x/y.png')).toBe(false);
    expect(isEmbeddableImage('/media/uploads/a.png')).toBe(false);
    expect(isEmbeddableImage('data:image/png;base64,AAA')).toBe(false);
    expect(isEmbeddableImage('uploads/../secret')).toBe(false);
  });
});
