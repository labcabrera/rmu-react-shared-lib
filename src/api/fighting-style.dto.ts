/** Fighting styles of rmu-api-core (spec 032). */
export type FightingStyleSkill = 'battle-styles' | 'combat-styles' | 'discipline-styles';

export const FIGHTING_STYLE_SKILLS: FightingStyleSkill[] = ['battle-styles', 'combat-styles', 'discipline-styles'];

export type StyleAbilityType = 'battle' | 'combat' | 'discipline' | 'any';

/** One equipment condition: weapon-skill, weapon-tag, two-handed, no-shield, mounted... */
export interface StyleCondition {
  kind: string;
  value?: string;
}

export interface StyleAbility {
  id: string;
  types: StyleAbilityType[];
  repeatable: boolean;
  maxTimes: number | null;
  requiresAbilities: string[];
  requiresSkills: string[];
  requiresTraits: string[];
  /** Alternatives (any of them), each with every condition; empty is none. */
  equipment: StyleCondition[][];
  /** Rule text (Markdown) imported with the catalog. */
  description?: string | null;
}

export interface FightingStyleAbility {
  abilityId: string;
  cost: number;
}

export interface FightingStyle {
  id: string;
  skillId: FightingStyleSkill;
  abilities: FightingStyleAbility[];
  requiresSkills: string[];
  requiresTraits: string[];
  equipment: StyleCondition[][];
}

export interface FightingStyles {
  styles: FightingStyle[];
  abilities: StyleAbility[];
}

export const isFightingStyleSkill = (skillId: string): skillId is FightingStyleSkill =>
  (FIGHTING_STYLE_SKILLS as string[]).includes(skillId);
