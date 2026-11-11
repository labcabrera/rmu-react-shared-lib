import { EntityType } from './common.dto';
import { RealmType } from './profession.dto';

export type ListType = 'open' | 'closed' | 'base' | 'evil';

export type SpellList = {
  id: string;
  type: ListType;
  /** One realm, or two for the base lists of a hybrid profession (spec 028). */
  realms: RealmType[];
  /** @deprecated (spec 028): the first of `realms`. */
  realm: RealmType;
  /** Required only for base lists. */
  professionId: string | null;
  /** Stable code of a book list. */
  code: string | null;
  /** Section of the book of a book list. */
  bookSection: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
  owner?: string;
  accessType?: string;
  /** Rulebook (`system`, admin only) or user content (spec 063). */
  entitySource: EntityType;
  version?: number;
  createdAt?: string;
  updatedAt?: string | null;
};

type ServerFields = 'id' | 'realm' | 'owner' | 'version' | 'createdAt' | 'updatedAt';

export type CreateSpellListDto = Omit<SpellList, ServerFields | 'entitySource'> & { entitySource?: EntityType };

/** A PATCH; send `version` back to detect a concurrent change. */
export type UpdateSpellListDto = Partial<Omit<SpellList, 'id' | 'realm'>>;
