import { AccessType } from './common.dto';

export type ManeuverType = 'absolute' | 'percent';

export type ManeuverLightUsage = 'none' | 'helpful' | 'required' | 'hiding';

export interface ManeuverActionPointsRange {
  min: number;
  max: number;
}

/** Maneuver profile of a skill category or skill (spec 010). */
export interface ManeuverProfile {
  defaultType: ManeuverType;
  resultTable: string;
  movement: boolean;
  light: ManeuverLightUsage;
  actionPoints?: ManeuverActionPointsRange;
}

export type ManeuverProfileOverrides = Partial<ManeuverProfile>;

export type ManeuverModifierType = 'flag' | 'choice' | 'number';

export interface ManeuverModifierScope {
  skillIds?: string[];
  categoryIds?: string[];
}

export interface ManeuverModifierOption {
  key: string;
  value: number;
}

export interface ManeuverModifier {
  id: string;
  /** Version of the stored entity; sent back in a PATCH, a concurrent change answers 409 (spec 018). */
  version?: number;
  key: string;
  scope: ManeuverModifierScope;
  type: ManeuverModifierType;
  value?: number;
  options?: ManeuverModifierOption[];
  perUnit?: number;
  min?: number;
  max?: number;
  description?: string;
  /** Reference only (OB/DB modifiers of a combat skill, spec 037): listed, never added to a maneuver roll. */
  reference?: boolean;
  accessType: AccessType;
  owner: string;
}
