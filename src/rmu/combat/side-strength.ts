/**
 * Strength of the sides of a tactical game (spec 100, decisions 10-15): the sum of the levels of their members,
 * split into standing, incapacitated and fled, and their combined hit points. Same rules and cases as
 * `side-strength.ts` in the tactical API.
 */

/** The minimum of an actor round the strength needs: the shape the tactical API sends. */
export interface SideStrengthActor {
  factionId?: string | null;
  level?: number | null;
  hp?: { max: number; current: number } | null;
  /** Active effects, read by `status`. */
  effects?: { status: string }[] | null;
}

/** A side of the game: an id and the factions in it. */
export interface SideStrengthSide {
  id: string;
  factionIds: string[];
}

export interface SideStrength {
  sideId: string;
  totalLevels: number;
  standingLevels: number;
  incapacitatedLevels: number;
  fledLevels: number;
  totalCount: number;
  standingCount: number;
  incapacitatedCount: number;
  fledCount: number;
  hpCurrent: number;
  hpMax: number;
}

/** Dead, dying, unconscious (also the legacy `unconcious`), incapacitated or paralyzed. */
export const SIDE_STRENGTH_INCAPACITATED = [
  'dead',
  'dying',
  'unconscious',
  'unconcious',
  'incapacitated',
  'paralyzed',
] as const;
/** Routed or broken by fear. */
export const SIDE_STRENGTH_FLED = ['fear-routed', 'fear-broken'] as const;

/** Thresholds of the standing strength marked on the bar and used by the fear triggers: 50, 25 and 10 %. */
export const SIDE_STRENGTH_THRESHOLDS = [0.5, 0.25, 0.1] as const;

const hasStatus = (actor: SideStrengthActor, statuses: readonly string[]) =>
  (actor.effects ?? []).some((effect) => statuses.includes(effect.status));

/** Levels an actor adds: its level, at least 1 (absent or 0 counts 1). */
export const sideStrengthLevel = (actor: SideStrengthActor): number => Math.max(1, actor.level ?? 1);

/** Where an actor stands: incapacitated first, then fled, otherwise standing. */
export const sideStrengthState = (actor: SideStrengthActor): 'standing' | 'incapacitated' | 'fled' => {
  if (hasStatus(actor, SIDE_STRENGTH_INCAPACITATED)) return 'incapacitated';
  if (hasStatus(actor, SIDE_STRENGTH_FLED)) return 'fled';
  return 'standing';
};

/**
 * One strength per side, in the order of `sides`. Every member counts, the fallen too; actors without a faction
 * or whose faction is in no side are left out. Hit points below 0 add 0.
 */
export const sideStrength = (actorRounds: SideStrengthActor[], sides: SideStrengthSide[]): SideStrength[] =>
  sides.map((side) => {
    const result: SideStrength = {
      sideId: side.id,
      totalLevels: 0,
      standingLevels: 0,
      incapacitatedLevels: 0,
      fledLevels: 0,
      totalCount: 0,
      standingCount: 0,
      incapacitatedCount: 0,
      fledCount: 0,
      hpCurrent: 0,
      hpMax: 0,
    };
    actorRounds
      .filter((actor) => !!actor.factionId && side.factionIds.includes(actor.factionId))
      .forEach((actor) => {
        const level = sideStrengthLevel(actor);
        const state = sideStrengthState(actor);
        result.totalLevels += level;
        result.totalCount += 1;
        result[`${state}Levels`] += level;
        result[`${state}Count`] += 1;
        if (actor.hp) {
          result.hpCurrent += Math.max(0, actor.hp.current ?? 0);
          result.hpMax += actor.hp.max ?? 0;
        }
      });
    return result;
  });

/** Standing share of the total strength, 0 to 1 (0 for an empty side). */
export const standingShare = (strength: SideStrength): number =>
  strength.totalLevels > 0 ? strength.standingLevels / strength.totalLevels : 0;
