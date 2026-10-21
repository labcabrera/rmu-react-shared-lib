import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Injury, InjurySeverity, InjuryStatus } from '../../api/health.dto';
import EditButton from '../../buttons/EditButton';
import { bonusColor } from '../character/StatPill';
import InjurySourceLine from './InjurySourceLine';
import InjuryTypeChip from './InjuryTypeChip';

const SEVERITY_COLORS: Record<InjurySeverity, 'default' | 'warning' | 'error'> = {
  light: 'default',
  medium: 'warning',
  severe: 'error',
};

const STATUS_COLORS: Record<InjuryStatus, 'default' | 'info' | 'secondary' | 'success'> = {
  active: 'default',
  recovering: 'info',
  permanent: 'secondary',
  healed: 'success',
};

/** Days of the recovery already passed, 0 to 100. */
export const recoveryProgress = (injury: Injury): number | undefined => {
  const recovery = injury.recovery;
  if (!recovery || recovery.totalDays <= 0) return undefined;
  const passed = recovery.totalDays - Math.max(0, recovery.remainingDays);
  return Math.min(100, Math.max(0, (passed / recovery.totalDays) * 100));
};

/**
 * One injury: type, severity, status, location and side, current and initial penalty, bleeding, remaining days of
 * the recovery, permanent penalty, description and origin. `dense` leaves out the description and the origin.
 */
const InjuryCard: FC<{
  injury: Injury;
  /** Extra buttons (treat, recovery roll…), shown at the top right. */
  actions?: ReactNode;
  onEdit?: (injury: Injury) => void;
  dense?: boolean;
  /** Link to the tactical game of the origin, see `InjurySourceLine`. */
  renderGameLink?: (tacticalGameId: string, label: string) => ReactNode;
}> = ({ injury, actions, onEdit, dense = false, renderGameLink }) => {
  const { t } = useTranslation();
  const bleeding = injury.bleeding ?? 0;
  const progress = recoveryProgress(injury);
  const isPermanent = injury.status === 'permanent' || injury.permanent !== undefined;
  const location = [
    injury.location ? t(injury.location) : undefined,
    injury.side ? t(`side-${injury.side}`) : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        p: dense ? 1 : 1.5,
        borderRadius: `${theme.radius.md}px`,
        opacity: injury.status === 'healed' ? 0.7 : 1,
      })}
    >
      <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1 }}>
        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75, flexGrow: 1, alignItems: 'center' }}>
          <InjuryTypeChip type={injury.type} />
          <Chip size="small" color={SEVERITY_COLORS[injury.severity]} label={t(`injury-severity-${injury.severity}`)} />
          {injury.status !== 'active' && (
            <Chip
              size="small"
              variant="outlined"
              color={STATUS_COLORS[injury.status]}
              label={t(`injury-status-${injury.status}`)}
            />
          )}
          {bleeding > 0 && (
            <Chip
              size="small"
              color="error"
              icon={<WaterDropIcon />}
              label={t('injury-bleeding-per-round', { value: bleeding })}
            />
          )}
          {bleeding === 0 && injury.bleedingControl && (
            <Chip
              size="small"
              variant="outlined"
              icon={<WaterDropIcon />}
              label={t(`bleeding-control-${injury.bleedingControl}`)}
            />
          )}
          {isPermanent && injury.status !== 'permanent' && (
            <Chip size="small" variant="outlined" color="secondary" label={t('permanent-injury')} />
          )}
          {(injury.flags || []).map((flag) => (
            <Chip key={flag} size="small" variant="outlined" color="warning" label={t(`injury-flag-${flag}`)} />
          ))}
        </Stack>
        {(actions || onEdit) && (
          <Stack direction="row" sx={{ alignItems: 'center', flexShrink: 0 }}>
            {actions}
            {onEdit && <EditButton onClick={() => onEdit(injury)} />}
          </Stack>
        )}
      </Stack>

      <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', columnGap: 2, rowGap: 0.5, mt: 1 }}>
        {location && (
          <Typography variant="body2" color="text.secondary">
            {location}
          </Typography>
        )}
        <Typography variant="body2">
          {t('penalty')}:{' '}
          <Box component="span" sx={{ fontWeight: 700, color: bonusColor(injury.penalty) }}>
            {injury.penalty}
          </Box>
          {injury.initialPenalty !== injury.penalty && (
            <Box component="span" sx={{ color: 'text.secondary' }}>
              {' '}
              {t('injury-initial-penalty-value', { value: injury.initialPenalty })}
            </Box>
          )}
        </Typography>
        {injury.permanent && (
          <Typography variant="body2" color="text.secondary">
            {t('permanent-penalty-value', { value: injury.permanent.penalty })}
          </Typography>
        )}
      </Stack>

      {progress !== undefined && injury.recovery && injury.status !== 'healed' && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label={t('injury-remaining-days', { count: injury.recovery.remainingDays })}
          />
          <Typography variant="caption" color="text.secondary">
            {t('injury-remaining-days', { count: injury.recovery.remainingDays })}
          </Typography>
        </Box>
      )}

      {!dense && injury.description && (
        <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-line' }}>
          {injury.description}
        </Typography>
      )}
      {!dense && (
        <Box sx={{ mt: 0.5 }}>
          <InjurySourceLine source={injury.source} renderGameLink={renderGameLink} />
        </Box>
      )}
    </Paper>
  );
};

export default InjuryCard;
