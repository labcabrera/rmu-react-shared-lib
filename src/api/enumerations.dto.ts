import { AccessType } from './common.dto';

export interface Enumeration {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  /** Normalized key (spec 050): what references store; derived from the name by the API and never changed. */
  key: string;
  /** Name as the user wrote it, shown when the key has no translation. */
  name: string;
  category: string;
  realmId: string | null;
  accessType: AccessType;
}

export type CreateEnumerationDto = Omit<Enumeration, 'id' | 'key'> & { key?: string };

export type UpdateEnumerationDto = Partial<Omit<Enumeration, 'id' | 'key'>>;
