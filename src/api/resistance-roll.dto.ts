export interface KeyValue {
  key: string;
  value: number;
}
export interface ResistanceRollQuery {
  attackLevel: number | null;
  targetLevel: number | null;
  roll: number | null;
  modifiers: KeyValue[] | undefined;
}

export interface ResistanceRollResult {
  result: string;
  modifiers: KeyValue[];
  totalRoll: number;
  failure: number;
}

export const emptyResistanceRollQuery: ResistanceRollQuery = {
  attackLevel: null,
  targetLevel: null,
  roll: null,
  modifiers: [{ key: 'other', value: 0 }],
};
