import { AccessType, EntityAccess, EntityShare, EntityType } from './common.dto';

export type MagicPresence = 'unlimited' | 'limited' | 'none';

export type Realm = {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  name: string;
  magicPresence: MagicPresence;
  shortDescription: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  owner?: string;
  accessType: AccessType;
  /** Rulebook (`system`, admin only) or user content (spec 063). */
  entitySource: EntityType;
  /** A realm whose NPCs every campaign can use (RMU Core, spec 055); only an admin sets it. Missing means `false`. */
  generic?: boolean;
  /** What the signed-in user can do with it (spec 069). */
  access?: EntityAccess;
  /** Who else reads or writes it: only for who manages it (spec 069). */
  shares?: EntityShare[];
};

export type CreateRealmDto = Omit<Realm, 'id' | 'owner' | 'entitySource' | 'access' | 'shares'> & { entitySource?: EntityType };

/** Narrows the realm list (spec 069): owned by the user, shared with the user, or public. */
export type RealmScope = 'mine' | 'shared' | 'public';

export const REALM_SCOPES: readonly RealmScope[] = ['mine', 'shared', 'public'];

export type UpdateRealmDto = Partial<Omit<Realm, 'id' | 'owner' | 'access' | 'shares'>>;
