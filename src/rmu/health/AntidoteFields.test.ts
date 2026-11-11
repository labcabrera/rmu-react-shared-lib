import { describe, expect, it } from 'vitest';
import { GiveAntidoteDto } from '../../api/poison.dto';
import { antidoteDto, AntidoteFieldsValue, EMPTY_ANTIDOTE_FIELDS } from './AntidoteFields';

const value = (patch: Partial<AntidoteFieldsValue>): AntidoteFieldsValue => ({ ...EMPTY_ANTIDOTE_FIELDS, ...patch });

describe('antidoteDto', () => {
  it('leaves the item source to what the MFE sends', () => {
    const itemDto: GiveAntidoteDto = { source: 'item', itemId: 'i1' };
    expect(antidoteDto(value({}), itemDto)).toBe(itemDto);
    expect(antidoteDto(value({}), undefined)).toBeUndefined();
  });

  it('needs a name for a spell, the level is optional', () => {
    expect(antidoteDto(value({ source: 'magic', name: '  ' }), undefined)).toBeUndefined();
    expect(antidoteDto(value({ source: 'magic', name: 'x' }), undefined)).toEqual({
      source: 'magic',
      name: 'x',
      level: undefined,
    });
  });

  it('needs categories and a level for a hand-given antidote', () => {
    const base = { source: 'external' as const, name: 'x' };
    expect(antidoteDto(value({ ...base, level: 3 }), undefined)).toBeUndefined();
    expect(antidoteDto(value({ ...base, categories: ['muscle'] }), undefined)).toBeUndefined();
    expect(antidoteDto(value({ ...base, categories: ['muscle'], level: 0 }), undefined)).toEqual({
      source: 'external',
      name: 'x',
      categories: ['muscle'],
      level: 0,
    });
  });
});
