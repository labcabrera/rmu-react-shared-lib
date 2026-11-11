import { AuthContextProps } from 'react-oidc-context';
import { apiCoreUrl } from '../config/config.service';
import callApi from './api';
import { HealingType, Injury, InjurySeverity, InjuryType } from './health.dto';

/** A row of the treatment difficulty table. */
export type TreatmentDifficultyRow = { procedure: string; injuryType: string; severity: string; difficulty: string };

export type TreatmentRules = { headDifficultySteps: number; cauterizePenaltyPerBleeding: number };

/** Rounds a procedure takes in combat (workspace spec 068); null: not offered in a tactical game. */
export type TreatmentDuration = { procedure: string; rounds: number | null; perBleeding: boolean };

export type SurgeryRequiredRow = { injuryType: InjuryType; severity: InjurySeverity };

/**
 * The healing tables of rmu-api-core (`GET /v1/healing-tables`), as far as the previews of the MFEs read them. The APIs
 * do the real computations; the values are rulebook content and are never written here.
 */
export interface HealingTables {
  healingTypeModifiers: Record<HealingType, number>;
  herbalismBonus: number;
  restHpPercentPerPeriod: number;
  restPeriodHours: number;
  fullRestDayMultiplier: number;
  talentMultipliers?: Record<string, number>;
  treatmentDifficulties?: TreatmentDifficultyRow[];
  treatmentRules?: TreatmentRules;
  /** Workspace spec 068: rounds of each procedure (missing in documents imported before it). */
  treatmentDurations?: TreatmentDuration[] | null;
  /** Workspace spec 068: injuries that only surgery or magic can treat (empty or missing before it). */
  surgeryRequired?: SurgeryRequiredRow[] | null;
  /** Workspace spec 068: range of the recovery modifier of a salve, null in documents imported before it. */
  salveModifier?: { min: number; max: number } | null;
}

/** It needs the rmu-core-law role: callers treat a failure as tables not available. */
export async function fetchHealingTables(auth: AuthContextProps): Promise<HealingTables> {
  return await callApi(auth, `${apiCoreUrl}/healing-tables`, { method: 'GET' });
}

/** The injury type and severity are in `surgeryRequired` of the healing tables (none without the list). */
export const requiresSurgery = (
  injury: Pick<Injury, 'type' | 'severity'>,
  surgeryRequired: SurgeryRequiredRow[] | null | undefined
): boolean => (surgeryRequired ?? []).some((row) => row.injuryType === injury.type && row.severity === injury.severity);
