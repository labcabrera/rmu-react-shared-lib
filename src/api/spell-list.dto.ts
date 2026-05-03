import { RealmType } from './profession.dto';

export type ListType = 'open' | 'closed' | 'base';
// export type RealmType = 'channeling' | 'essence' | 'mentalism';

// export const REALM_TYPES: RealmType[] = ['channeling', 'essence', 'mentalism'];

export type SpellList = {
  id: string;
  type: ListType;
  realm: RealmType;
  professionId: string | null;
  name: string;
  description: string | null;
  imageUrl: string | null;
};

export type CreateSpellListDto = Omit<SpellList, 'id'>;

export type UpdateSpellListDto = Partial<Omit<SpellList, 'id'>>;
