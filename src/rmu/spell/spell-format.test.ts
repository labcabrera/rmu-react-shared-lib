import { describe, expect, it } from 'vitest';
import { spellSpecsRows } from './spell-format';

const t = (key: string) => key;

describe('spellSpecsRows (spec 077)', () => {
  const range = { type: 'distance', value: 100, perLevel: false, increment: null, raw: null };
  const duration = {
    type: 'concentration',
    value: null,
    scale: null,
    perLevel: null,
    perFailure: null,
    concentration: true,
    raw: null,
  };

  it('shows the adjusted range next to the original and leaves out what the talents do not change', () => {
    const rows = spellSpecsRows(
      { range, area: null, duration },
      { range: { ...range, value: 150 }, area: null, duration },
      t
    );
    expect(rows).toEqual([
      { kind: 'range', original: "100'", adjusted: "150'" },
      { kind: 'duration', original: 'concentration', adjusted: null },
    ]);
  });

  it('gives no adjusted text without adjustments', () => {
    expect(spellSpecsRows({ range }, null, t)).toEqual([{ kind: 'range', original: "100'", adjusted: null }]);
  });
});
