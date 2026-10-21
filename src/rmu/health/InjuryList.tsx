import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { Injury, InjuryStatus } from '../../api/health.dto';
import InjuryCard from './InjuryCard';

const STATUS_ORDER: InjuryStatus[] = ['active', 'recovering', 'permanent', 'healed'];

const SEVERITY_ORDER = ['severe', 'medium', 'light'];

/** Injuries by status (active, recovering, permanent, healed) and, within a status, the most severe first. */
export const sortInjuries = (injuries: Injury[]): Injury[] =>
  [...injuries].sort(
    (a, b) =>
      STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status) ||
      SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

/** List of injury cards. Healed injuries are left out unless `showHealed`. */
const InjuryList: FC<{
  injuries: Injury[];
  /** Buttons of each card (treat, recovery roll…). */
  renderActions?: (injury: Injury) => ReactNode;
  onEdit?: (injury: Injury) => void;
  /** Text when there are no injuries to show (default `t('no-injuries')`). */
  emptyText?: string;
  showHealed?: boolean;
  dense?: boolean;
  renderGameLink?: (tacticalGameId: string, label: string) => ReactNode;
}> = ({ injuries, renderActions, onEdit, emptyText, showHealed = false, dense = false, renderGameLink }) => {
  const { t } = useTranslation();
  const visible = sortInjuries(injuries.filter((injury) => showHealed || injury.status !== 'healed'));

  if (visible.length === 0) {
    return <Typography color="text.secondary">{emptyText ?? t('no-injuries')}</Typography>;
  }

  return (
    <Stack spacing={dense ? 1 : 1.5}>
      {visible.map((injury) => (
        <InjuryCard
          key={injury.id}
          injury={injury}
          actions={renderActions?.(injury)}
          onEdit={onEdit}
          dense={dense}
          renderGameLink={renderGameLink}
        />
      ))}
    </Stack>
  );
};

export default InjuryList;
