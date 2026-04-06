export const MANEUVER_DIFFICULTIES: ManeuverDifficulty[] = [
  { id: 'c', modifier: 70 },
  { id: 's', modifier: 50 },
  { id: 'r', modifier: 30 },
  { id: 'e', modifier: 20 },
  { id: 'l', modifier: 10 },
  { id: 'm', modifier: 0 },
  { id: 'h', modifier: -10 },
  { id: 'vh', modifier: -20 },
  { id: 'xh', modifier: -30 },
  { id: 'sf', modifier: -50 },
  { id: 'a', modifier: -70 },
  { id: 'ni', modifier: -100 },
];

export interface AbsoluteManeuverTable {
  name: string;
  table: AbsoluteManeuverTableEntry[];
  unusualEvent: string;
}

export interface AbsoluteManeuverTableEntry {
  min: number | null;
  max: number | null;
  result: AbsoluteManeuverResult;
}

export interface PercentManeuverResult {
  percent: number;
  critical: string | undefined;
  message: string;
}

export interface AbsoluteManeuverResult {
  result: string;
  message: string;
  penaltyUntilAbsoluteSuccess?: number;
  bonusUntilAbsoluteFailure?: number;
}

export interface EnduranceManeuverResult {
  result: string;
  message: string;
  fatigue: number;
  hitPoints: number;
  bonus: number;
}

export interface ManeuverDifficulty {
  id: string;
  modifier: number;
}
