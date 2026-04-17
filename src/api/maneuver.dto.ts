import { KeyValue } from './common.dto';

export const MANEUVER_DIFFICULTIES: KeyValue[] = [
  { key: 'c', value: 70 },
  { key: 's', value: 50 },
  { key: 'r', value: 30 },
  { key: 'e', value: 20 },
  { key: 'l', value: 10 },
  { key: 'm', value: 0 },
  { key: 'h', value: -10 },
  { key: 'vh', value: -20 },
  { key: 'xh', value: -30 },
  { key: 'sf', value: -50 },
  { key: 'a', value: -70 },
  { key: 'ni', value: -100 },
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
