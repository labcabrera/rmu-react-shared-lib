import { Injury } from '../../api/health.dto';

// Sample injuries for tests and stories; not taken from any rulebook.

export const bleedingCut: Injury = {
  id: 'injury-1',
  type: 'cut-burn',
  severity: 'medium',
  location: 'arm',
  side: 'left',
  penalty: -25,
  initialPenalty: -25,
  bleeding: 3,
  flags: ['permanent-risk'],
  description: 'Deep cut on the forearm',
  source: {
    kind: 'critical',
    tacticalGameId: 'game-1',
    tacticalGameName: 'Ambush at the ford',
    round: 3,
    attackerId: 'orc-1',
    attackerName: 'Orc captain',
    criticalKey: 'S-C-91',
  },
  treatments: [],
  status: 'active',
  createdAt: '2026-10-20T10:00:00Z',
};

export const recoveringBone: Injury = {
  id: 'injury-2',
  type: 'bone',
  severity: 'severe',
  location: 'leg',
  side: 'right',
  penalty: -30,
  initialPenalty: -50,
  bleeding: 0,
  bleedingControl: 'stitches',
  source: { kind: 'fumble', round: 5 },
  treatments: [],
  recovery: {
    roll: 60,
    modifiers: 10,
    total: 70,
    baseDays: 20,
    multiplier: 1,
    totalDays: 20,
    remainingDays: 5,
    startedAt: '2026-10-20T10:00:00Z',
  },
  status: 'recovering',
  createdAt: '2026-10-20T10:00:00Z',
};

export const permanentOrgan: Injury = {
  id: 'injury-3',
  type: 'organ',
  severity: 'light',
  penalty: -5,
  initialPenalty: -15,
  permanent: { penalty: -5, roll: 42 },
  source: { kind: 'manual' },
  treatments: [],
  status: 'permanent',
  createdAt: '2026-10-10T10:00:00Z',
};

export const healedSkin: Injury = {
  id: 'injury-4',
  type: 'skin-tissue',
  severity: 'light',
  penalty: 0,
  initialPenalty: -10,
  source: { kind: 'fatigue' },
  treatments: [],
  status: 'healed',
  createdAt: '2026-10-01T10:00:00Z',
  healedAt: '2026-10-05T10:00:00Z',
};

export const sampleInjuries: Injury[] = [healedSkin, permanentOrgan, recoveringBone, bleedingCut];
