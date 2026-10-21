import { AccessType } from './common.dto';
import { ManeuverProfile, ManeuverProfileOverrides } from './maneuver-modifier.dto';

export interface Skill {
  id: string;
  categoryId: string;
  bonus: string[];
  realmBonus: number | null;
  specialization: string | null;
  owner: string;
  accessType: AccessType;
  /** Effective maneuver profile (category profile with the skill's overrides applied). */
  maneuver?: ManeuverProfile;
  /** The skill's own partial values. */
  maneuverOverrides?: ManeuverProfileOverrides;
}

export type CreateSkillDto = Omit<Skill, 'owner' | 'maneuver' | 'maneuverOverrides'> & {
  maneuver?: ManeuverProfileOverrides;
};

export type UpdateSkillDto = Partial<Omit<Skill, 'id' | 'owner' | 'maneuver' | 'maneuverOverrides'>> & {
  maneuver?: ManeuverProfileOverrides | null;
};
