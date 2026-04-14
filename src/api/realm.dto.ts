import { AccessType } from './common.dto';

export type MagicPresence = 'unlimited' | 'limited' | 'none';

export type Realm = {
  id: string;
  name: string;
  magicPresence: MagicPresence;
  shortDescription: string | undefined;
  description: string | undefined;
  imageUrl: string | undefined;
  accessType: AccessType;
};

export type CreateRealmDto = Omit<Realm, 'id'>;

export type UpdateRealmDto = Partial<Omit<Realm, 'id'>>;
