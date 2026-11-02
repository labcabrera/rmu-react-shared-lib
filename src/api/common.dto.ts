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

/**
 * What the signed-in user can do with an entity, as the API answers it (spec 069): read; write (change it and what
 * hangs from it); manage (also delete it, change its visibility and its shares).
 */
export type EntityAccess = 'read' | 'write' | 'manage';

/** Level of a share (spec 069): read, or read and write. */
export type ShareLevel = 'read' | 'write';

export const SHARE_LEVELS: readonly ShareLevel[] = ['read', 'write'];

/** An access the owner gave to a friend (spec 069). Only who manages the entity receives them. */
export type EntityShare = {
  userId: string;
  userName: string;
  level: ShareLevel;
  grantedAt: string;
};

