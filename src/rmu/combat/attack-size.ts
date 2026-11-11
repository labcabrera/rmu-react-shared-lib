import { CREATURE_SIZES, CreatureSize } from '../../api/npc.dto';

/** Size class of Medium: the steps of an attack size are its class minus this. */
export const MEDIUM_SIZE_CLASS = 5;

/** Hit Multiplier of table 9-4a by size class - 1, extended to XIII with Creature Law (T-3.1c). */
const HIT_MULTIPLIERS = [0.25, 0.5, 0.67, 0.75, 1, 1.5, 2, 3, 4, 5, 6, 7, 8] as const;

export interface AttackSizeStep {
  sizeId: CreatureSize;
  /** Size class, 1 (minuscule) to 13 (leviathan). */
  sizeClass: number;
  /** Steps from Medium (class - 5). */
  steps: number;
  /** Damage multiplier of the attack (§9.4, table 9-4a). */
  hitMultiplier: number;
}

/** The thirteen sizes of attacks and creatures (workspace spec 075), smallest first. */
export const ATTACK_SIZE_SCALE: readonly AttackSizeStep[] = CREATURE_SIZES.map((sizeId, index) => ({
  sizeId,
  sizeClass: index + 1,
  steps: index + 1 - MEDIUM_SIZE_CLASS,
  hitMultiplier: HIT_MULTIPLIERS[index],
}));

export interface AttackSizeEffect {
  sizeId: CreatureSize;
  /** Steps from Medium, clamped to the scale. */
  steps: number;
  hitMultiplier: number;
  /** Critical severity levels the attack moves against a Medium target: the steps. */
  criticalShift: number;
}

const MIN_STEPS = ATTACK_SIZE_SCALE[0].steps;
const MAX_STEPS = ATTACK_SIZE_SCALE[ATTACK_SIZE_SCALE.length - 1].steps;

/** Clamps a number of steps from Medium to the scale (a missing or invalid value is Medium). */
export const clampSizeSteps = (steps: number | null | undefined): number => {
  if (steps === null || steps === undefined || !Number.isFinite(steps)) return 0;
  return Math.min(MAX_STEPS, Math.max(MIN_STEPS, Math.round(steps)));
};

/** Damage multiplier and critical shift of an attack `steps` sizes from Medium (§9.4). */
export const attackSizeEffect = (steps: number | null | undefined): AttackSizeEffect => {
  const clamped = clampSizeSteps(steps);
  const step = ATTACK_SIZE_SCALE[clamped - MIN_STEPS];
  return { sizeId: step.sizeId, steps: clamped, hitMultiplier: step.hitMultiplier, criticalShift: clamped };
};

/** Critical levels an attack `attackSteps` from Medium moves against a target `targetSteps` from Medium. */
export const expectedCriticalShift = (attackSteps: number | null | undefined, targetSteps: number | null | undefined) =>
  clampSizeSteps(attackSteps) - clampSizeSteps(targetSteps);

/** A multiplier as the language writes it (`1,5` in Spanish), up to two decimals. */
export const formatMultiplier = (value: number, locale?: string): string => {
  try {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value);
  } catch {
    return String(value);
  }
};

/** Signed number of levels or steps: `+1`, `-2`, `0`. */
export const signedSteps = (value: number): string => (value > 0 ? `+${value}` : `${value}`);
