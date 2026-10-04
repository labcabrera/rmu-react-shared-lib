import { AccessType, EntityType } from './common.dto';

export const effectPropertyRequirements = ['required', 'optional', 'forbidden'] as const;

export type EffectPropertyRequirement = (typeof effectPropertyRequirements)[number];

export interface EffectType {
  id: string;
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
