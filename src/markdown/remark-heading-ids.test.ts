import { describe, expect, it } from 'vitest';
import { remarkHeadingIds } from './remark-heading-ids';

type Node = { type: string; value?: string; children?: Node[]; data?: { hProperties?: Record<string, unknown> } };

const heading = (...children: Node[]): Node => ({ type: 'heading', children });
const text = (value: string): Node => ({ type: 'text', value });

describe('remarkHeadingIds', () => {
  it('uses the explicit id and drops it from the text', () => {
    const node = heading(text('Parar al que viene {#parry-incoming}'));
    remarkHeadingIds()({ type: 'root', children: [node] });
    expect(node.children?.[0].value).toBe('Parar al que viene');
    expect(node.data?.hProperties?.id).toBe('parry-incoming');
  });

  it('falls back to the slug of the whole text, emphasis included', () => {
    const node = heading(text('Retirarse '), { type: 'emphasis', children: [text('con cuidado')] });
    remarkHeadingIds()({ type: 'root', children: [node] });
    expect(node.data?.hProperties?.id).toBe('retirarse-con-cuidado');
  });
});
