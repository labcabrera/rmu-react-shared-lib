import { AccessType } from './common.dto';

export interface Enumeration {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  key: string;
  category: string;
  realmId: string | null;
  accessType: AccessType;
}

export type CreateEnumerationDto = Omit<Enumeration, 'id'>;

export type UpdateEnumerationDto = Partial<Omit<Enumeration, 'id'>>;
