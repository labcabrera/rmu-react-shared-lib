import React, { FC, KeyboardEvent, ReactNode, RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography } from '@mui/material';

/** Size of a key of the keypads, the same in NumberPad and RollPad. */
export const PAD_KEY_SX = { minHeight: 56, minWidth: 0, fontSize: '1.35rem', fontWeight: 600 } as const;

/**
 * The layout shared by the keypads (spec 085, 3.3), so that a number and a roll are entered alike: a display with
 * the label, the value and a line below it (the range, the state of the roll), an optional row of extras (quick
 * adjustments, a random roll), the keys, and the actions always in the same order: Clear · Cancel · Accept.
 */
const PadLayout: FC<{
  padRef: RefObject<HTMLDivElement | null>;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  ariaLabel: string;
  testId?: string;
  label?: string;
  /** The value being entered. */
  display: ReactNode;
  /** The line under the value. */
  displayNote?: ReactNode;
  invalid?: boolean;
  extras?: ReactNode;
  /** The twelve keys, in a 3-column grid. */
  keys: ReactNode;
  onClear: () => void;
  onCancel: () => void;
  onAccept: () => void;
  acceptDisabled?: boolean;
  /** Accept by default; another text when accepting does something else (the next die). */
  acceptLabel?: string;
  /** Before the actions, e.g. a backspace when the keys have no room for it. */
  actionsStart?: ReactNode;
}> = ({
  padRef,
  onKeyDown,
  ariaLabel,
  testId,
  label,
  display,
  displayNote,
  invalid = false,
  extras,
  keys,
  onClear,
  onCancel,
  onAccept,
  acceptDisabled = false,
  acceptLabel,
  actionsStart,
}) => {
  const { t } = useTranslation();
  return (
    <Box
      ref={padRef}
      tabIndex={-1}
      onKeyDown={onKeyDown}
      data-testid={testId}
      role="group"
      aria-label={ariaLabel}
      sx={{ p: 2, width: { xs: '100%', sm: 320 }, maxWidth: '100%', mx: 'auto', outline: 'none' }}
    >
      <Stack spacing={1.5}>
        <Box
          sx={{
            px: 2,
            py: 1,
            border: 1,
            borderColor: invalid ? 'error.main' : 'divider',
            borderRadius: (theme) => `${theme.radius.sm}px`,
          }}
        >
          {label && (
            <Typography variant="caption" color="text.secondary" component="div">
              {label}
            </Typography>
          )}
          {display}
          {displayNote && (
            <Typography
              variant="caption"
              color={invalid ? 'error' : 'text.secondary'}
              component="div"
              aria-live="polite"
            >
              {displayNote}
            </Typography>
          )}
        </Box>
        {extras}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>{keys}</Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: actionsStart ? '1fr 1fr 1fr 2fr' : '1fr 1fr 2fr',
            gap: 1,
          }}
        >
          {actionsStart}
          <Button variant="text" color="inherit" onClick={onClear}>
            {t('clear')}
          </Button>
          <Button variant="text" onClick={onCancel}>
            {t('cancel')}
          </Button>
          <Button variant="contained" onClick={onAccept} disabled={acceptDisabled} sx={{ minHeight: 44 }}>
            {acceptLabel ?? t('accept')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default PadLayout;
