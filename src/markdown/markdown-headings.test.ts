import { describe, expect, it } from 'vitest';
import { extractHeadings, slugify, splitHeadingId } from './markdown-headings';

describe('slugify', () => {
  it('drops accents, symbols and spaces', () => {
    expect(slugify('1. El asalto en 30 segundos')).toBe('1-el-asalto-en-30-segundos');
    expect(slugify("Ejemplo: ¿correr o ir con calma? (50')")).toBe('ejemplo-correr-o-ir-con-calma-50');
    expect(slugify('Parar al que viene')).toBe('parar-al-que-viene');
  });
});

describe('splitHeadingId', () => {
  it('takes the explicit id at the end of a heading, else the slug', () => {
    expect(splitHeadingId('Parar al que viene {#parry-incoming}')).toEqual({
      text: 'Parar al que viene',
      id: 'parry-incoming',
    });
    expect(splitHeadingId('Parar al que viene')).toEqual({ text: 'Parar al que viene', id: 'parar-al-que-viene' });
  });
});

describe('extractHeadings', () => {
  it('lists the second level headings outside code blocks, as plain text', () => {
    const markdown = [
      '# Title',
      '## 1. **Uno**',
      '### Sub',
      '```',
      '## not a heading',
      '```',
      '## Dos con [enlace](x.md)',
      '## Tres {#three}',
    ].join('\n');
    expect(extractHeadings(markdown)).toEqual([
      { text: '1. Uno', id: '1-uno' },
      { text: 'Dos con enlace', id: 'dos-con-enlace' },
      { text: 'Tres', id: 'three' },
    ]);
  });
});
