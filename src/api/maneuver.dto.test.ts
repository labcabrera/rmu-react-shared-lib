import { describe, expect, it } from 'vitest';
import { translated } from './maneuver.dto';

describe('translated', () => {
  it('uses the translation of the base language and falls back to the text', () => {
    expect(translated('Success.', { es: 'Éxito.' }, 'es-ES')).toBe('Éxito.');
    expect(translated('Success.', { es: 'Éxito.' }, 'en')).toBe('Success.');
    expect(translated('Success.', undefined, 'es')).toBe('Success.');
    expect(translated('Success.', { es: 'Éxito.' }, undefined)).toBe('Success.');
  });
});
