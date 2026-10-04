export type EntityType = 'system' | 'user';
export type AccessType = 'public' | 'private';

export type KeyValue = {
  key: string;
  value: number;
};

export type KeyLabel = {
  key: string;
  label: string;
};

export type NamedEntity = {
  id: string;
  name: string;
};
