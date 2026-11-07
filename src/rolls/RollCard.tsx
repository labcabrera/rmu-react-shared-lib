import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { alpha, Box, Stack, Typography } from '@mui/material';

/** Where a roll stands: still to enter, entered, or entered with a consequence to deal with (a critical, a fumble). */
export type RollCardStatus = 'pending' | 'done' | 'attention';

const STATUS_COLOR: Record<RollCardStatus, 'text.secondary' | 'success.main' | 'warning.main'> = {
  pending: 'text.secondary',
  done: 'success.main',
  attention: 'warning.main',
};

const StatusIcon: FC<{ status: RollCardStatus }> = ({ status }) => {
  const sx = { fontSize: 18, color: STATUS_COLOR[status] };
  if (status === 'done') return <CheckCircleIcon sx={sx} />;
  if (status === 'attention') return <ErrorOutlineIcon sx={sx} />;
  return <RadioButtonUncheckedIcon sx={sx} />;
};

export interface RollCardProps {
  /** What is rolled: "Attack roll", "Critical roll", "Parry maneuver". */
  title: string;
  status?: RollCardStatus;
  /** One line on what the roll waits for or what it caused; defaults to the generic text of the status. */
  statusText?: ReactNode;
  /** The roll input, usually a RollField. */
  field?: ReactNode;
  /** The result of the roll with its modifiers. */
  total?: ReactNode;
  totalLabel?: string;
  /** A note under the total (the fumble range…). */
  caption?: ReactNode;
  /** What the roll gives: damage, critical, effects. */
  chips?: ReactNode;
  /** Anything the roll needs below: options before it, texts of its result. */
  children?: ReactNode;
}

/**
 * One roll of a guided flow (spec 085, 2.4): its title and status on one line, the input next to its total, and what
 * it gives below. The same card for the attack roll, the criticals, the fumble and the maneuvers, so that every roll
 * reads alike and says on its own whether it is still to enter.
 */
const RollCard: FC<RollCardProps> = ({
  title,
  status = 'pending',
  statusText,
  field,
  total,
  totalLabel,
  caption,
  chips,
  children,
}) => {
  const { t } = useTranslation();
  const hasTotal = total !== undefined && total !== null && total !== '';
  return (
    <Box
      component="section"
      aria-label={title}
      sx={(theme) => ({
        p: 1.5,
        border: 1,
        borderRadius: `${theme.radius.sm}px`,
        borderColor:
          status === 'attention'
            ? alpha(theme.palette.warning.main, 0.6)
            : status === 'done'
              ? alpha(theme.palette.success.main, 0.4)
              : 'divider',
        bgcolor: status === 'pending' ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
      })}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
          <StatusIcon status={status} />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
            {title}
          </Typography>
          <Typography variant="caption" sx={{ color: STATUS_COLOR[status], minWidth: 0 }} noWrap>
            {statusText ?? t(`roll-card-${status}`)}
          </Typography>
        </Stack>
        {(field || hasTotal) && (
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
            {field && <Box sx={{ flex: { xs: '1 1 180px', sm: '0 0 auto' }, minWidth: 0 }}>{field}</Box>}
            {hasTotal && (
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums' }}>
                  {total}
                </Typography>
                <Typography variant="caption" color="text.secondary" component="div">
                  {totalLabel ?? t('total')}
                </Typography>
                {caption && (
                  <Typography variant="caption" color="text.secondary" component="div">
                    {caption}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>
        )}
        {chips}
        {children}
      </Stack>
    </Box>
  );
};

export default RollCard;
