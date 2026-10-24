import { AccessType, EntityType } from './common.dto';

export const effectPropertyRequirements = ['required', 'optional', 'forbidden'] as const;

export type EffectPropertyRequirement = (typeof effectPropertyRequirements)[number];

export interface EffectType {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  isPersistent: boolean;
  isStackable: boolean;
  value: EffectPropertyRequirement;
  modifier: EffectPropertyRequirement;
  rounds: EffectPropertyRequirement;
  text: EffectPropertyRequirement;
  location: EffectPropertyRequirement;
  delay: EffectPropertyRequirement;
  owner: string;
  accessType: AccessType;
  entitySource: EntityType;
}

export type CreateEffectTypeDto = Omit<EffectType, 'owner' | 'entitySource'>;

export type UpdateEffectTypeDto = Partial<Omit<EffectType, 'id' | 'owner' | 'entitySource'>>;
