import { ImportPreview, ImportResult } from '../../api/character-export.dto';

/** Previews and results of an import for the tests and the stories (invented data). */
export const characterPreview: ImportPreview = {
  kind: 'character',
  target: 'character',
  name: 'Kaelith',
  formatVersion: 1,
  currentFormatVersion: 1,
  appVersion: '0.6.0',
  currentAppVersion: '0.6.0',
  steps: [],
  source: {
    gameName: 'Old campaign',
    factionName: 'Wanderers',
    realmName: 'Realm A',
    exportedAt: '2026-10-20T10:00:00Z',
  },
  summary: { characters: 1, items: 4, gold: 12.5 },
  characters: [{ ref: 'c1', name: 'Kaelith', level: 3, raceName: 'Human' }],
  characterRef: 'c1',
  warnings: [],
  errors: [],
};

export const migratedPreview: ImportPreview = {
  ...characterPreview,
  formatVersion: 0,
  upgradedFrom: 0,
  appVersion: '0.5.0',
  steps: [{ from: 0, to: 1, description: 'Renames hits to hp' }],
  warnings: [{ code: 'import-warning-app-version', message: 'Exported with 0.5.0', kind: 'version' }],
};

export const warningsPreview: ImportPreview = {
  ...characterPreview,
  warnings: [
    { code: 'import-warning-missing-skill', message: 'Skill missing', kind: 'skill', id: 'skill-a' },
    { code: 'import-warning-missing-skill', message: 'Skill missing', kind: 'skill', id: 'skill-b' },
    { code: 'import-warning-realm-mismatch', message: 'Other realm', kind: 'realm', name: 'Realm A' },
  ],
};

export const errorsPreview: ImportPreview = {
  ...characterPreview,
  errors: [
    { code: 'export-missing-reference', message: 'The race race-x does not exist here', kind: 'race', id: 'race-x' },
  ],
};

export const factionFilePreview: ImportPreview = {
  ...characterPreview,
  kind: 'faction',
  target: 'character',
  name: 'Wanderers',
  summary: { characters: 2, items: 9, gold: 120 },
  characters: [
    { ref: 'c1', name: 'Kaelith', level: 3, raceName: 'Human' },
    { ref: 'c2', name: 'Doran', level: 5, raceName: 'Dwarf' },
  ],
  characterRef: undefined,
  errors: [{ code: 'export-character-ref-required', message: 'Choose a character of the file' }],
};

export const importResult: ImportResult = {
  kind: 'character',
  target: 'character',
  importId: 'import-1',
  factionId: 'faction-1',
  characterIds: ['character-1'],
  itemCount: 4,
  warnings: [],
};
