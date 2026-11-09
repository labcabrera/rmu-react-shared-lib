import { describe, expect, it } from 'vitest';
import { requiresSurgery, SurgeryRequiredRow } from './healing-tables';
import { Injury } from './health.dto';

const injury = (type: string, severity: string) => ({ type, severity }) as Pick<Injury, 'type' | 'severity'>;

describe('requiresSurgery', () => {
  const list = [{ injuryType: 'bone', severity: 'severe' }] as SurgeryRequiredRow[];

  it('needs both the type and the severity in the list', () => {
    expect(requiresSurgery(injury('bone', 'severe'), list)).toBe(true);
    expect(requiresSurgery(injury('bone', 'light'), list)).toBe(false);
    expect(requiresSurgery(injury('burn', 'severe'), list)).toBe(false);
  });

  it('is false without the list', () => {
    expect(requiresSurgery(injury('bone', 'severe'), undefined)).toBe(false);
    expect(requiresSurgery(injury('bone', 'severe'), null)).toBe(false);
  });
});
