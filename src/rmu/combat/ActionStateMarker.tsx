import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { CombatActionState, combatColors } from './actionTypes';

/**
 * State of an action on the board, never by color alone: an icon or dot shape per state, an
 * accessible name, and an optional short text (for example the result "+42 hits").
 * - pending: the action needs input from the user (a solid dot);
 * - waiting: it waits for another actor (an outlined dot);
 * - resolved: done (a check);
 * - failed: a fumble or a failed maneuver (an error icon).
 */
const ActionStateMarker: FC<{ state: CombatActionState; text?: string }> = ({ state, text }) => {
  const { t } = useTranslation();
  const label = t(`action-state-${state}`);
  let mark;
  if (state === 'resolved')
    mark = <CheckCircleIcon sx={(theme) => ({ fontSize: 16, color: combatColors(theme).resolved })} />;
  else if (state === 'failed')
    mark = <ErrorOutlinedIcon sx={(theme) => ({ fontSize: 16, color: combatColors(theme).failed })} />;
  else
    mark = (
      <Box
        sx={(theme) => ({
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: state === 'pending' ? combatColors(theme).pending : 'transparent',
          border: `2px solid ${combatColors(theme)[state]}`,
        })}
      />
    );
  return (
    <Tooltip title={label}>
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
