import { TemporaryModifier } from '../../api/temporary-modifier.dto';

// Sample temporary modifiers for tests and stories (workspace spec 068); invented values.

export const moraleBonus: TemporaryModifier = {
  id: 'modifier-1',
  kind: 'morale',
  value: 10,
  source: 'morale-absolute-success',
  days: 7,
  createdAt: '2026-10-20T10:00:00Z',
  tacticalGameId: 'game-1',
  expiresGameDay: 17,
};

export const fearRrBonus: TemporaryModifier = {
  id: 'modifier-2',
  kind: 'fear-rr',
  value: 20,
  source: 'rally-unusual',
  days: 1,
  createdAt: '2026-10-20T10:00:00Z',
  tacticalGameId: 'game-1',
};

export const manualPenalty: TemporaryModifier = {
  id: 'modifier-3',
  kind: 'morale',
  value: -5,
  source: 'manual',
  days: null,
  createdAt: '2026-10-20T10:00:00Z',
  tacticalGameId: null,
  expiresGameDay: null,
};

export const sampleTemporaryModifiers: TemporaryModifier[] = [moraleBonus, fearRrBonus, manualPenalty];
