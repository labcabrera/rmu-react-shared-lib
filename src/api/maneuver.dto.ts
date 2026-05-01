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
