import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { CombatActionState, combatColors } from './actionTypes';

/** Translation key of the name of each state: the readiness states use the `action-readiness-*` keys. */
const LABEL_KEYS: Record<CombatActionState, string> = {
  pending: 'action-state-pending',
  waiting: 'action-state-waiting',
  resolved: 'action-state-resolved',
  failed: 'action-state-failed',
  blocked: 'action-readiness-blocked',
  unreachable: 'action-readiness-unreachable',
  optimal: 'action-readiness-optimal',
  held: 'action-readiness-held',
};

const ICON_SIZE = 16;

const Dot: FC<{ state: 'pending' | 'waiting' | 'blocked' | 'optimal' }> = ({ state }) => (
  <Box
    sx={(theme) => {
      const colors = combatColors(theme);
      const size = state === 'optimal' ? 12 : 10;
      if (state === 'blocked')
        return {
          width: size,
          height: size,
          borderRadius: '50%',
          bgcolor: 'transparent',
          border: `2px solid ${theme.palette.text.disabled}`,
        };
      return {
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: state === 'waiting' ? 'transparent' : colors[state],
        border: `2px solid ${colors[state]}`,
        // The optimal dot is larger and ringed, so it is told apart from the pending one without its color.
        boxShadow:
          state === 'optimal' ? `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 3px ${colors.optimal}` : 'none',
      };
    }}
  />
);

/**
 * State of an action on the board, never by color alone: an icon or dot shape per state, an
 * accessible name, and an optional short text (for example the result "+42 hits").
 * - pending: the action needs input from the user (a solid dot); also an action that can be resolved with a penalty
 *   or whose resolution is under way;
 * - optimal: it can be resolved with its maximum action points (a larger ringed dot in the `optimal` color);
 * - blocked: below its minimum action points, it will reach them this round (a hollow grey circle);
 * - unreachable: it will not reach its minimum this round (a warning);
 * - held: held by the game master (a pause icon);
 * - waiting: it waits for another actor (an outlined dot);
 * - resolved: done (a check);
 * - failed: a fumble, a failed maneuver or an action that ended without being resolved (an error icon).
 *
 * `tooltip` replaces the name of the state in the tooltip (for example with the action points of the action).
 */
const ActionStateMarker: FC<{ state: CombatActionState; text?: string; tooltip?: ReactNode }> = ({
  state,
  text,
  tooltip,
}) => {
  const { t } = useTranslation();
  const label = t(LABEL_KEYS[state] ?? `action-state-${state}`);
  let mark;
  if (state === 'resolved')
    mark = <CheckCircleIcon sx={(theme) => ({ fontSize: ICON_SIZE, color: combatColors(theme).resolved })} />;
  else if (state === 'failed')
    mark = <ErrorOutlinedIcon sx={(theme) => ({ fontSize: ICON_SIZE, color: combatColors(theme).failed })} />;
  else if (state === 'unreachable')
    mark = <WarningAmberIcon sx={(theme) => ({ fontSize: ICON_SIZE, color: theme.palette.warning.main })} />;
  else if (state === 'held')
    mark = <PauseCircleIcon sx={(theme) => ({ fontSize: ICON_SIZE, color: combatColors(theme).waiting })} />;
  else mark = <Dot state={state} />;
  return (
    <Tooltip title={tooltip ?? label}>
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ alignItems: 'center' }}
        role="img"
        aria-label={text ? `${label}: ${text}` : label}
      >
        {mark}
        {text && (
          <Typography variant="caption" sx={{ fontWeight: 600 }} noWrap>
            {text}
          </Typography>
        )}
      </Stack>
    </Tooltip>
  );
};

export default ActionStateMarker;
