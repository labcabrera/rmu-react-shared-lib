import { ManeuverProfileOverrides } from './maneuver-modifier.dto';

export interface SkillCategory {
  id: string;
  bonus: string[];
  realmBonus: number | null;
  /** Own maneuver profile of the category, if any. */
  maneuver?: ManeuverProfileOverrides;
}
