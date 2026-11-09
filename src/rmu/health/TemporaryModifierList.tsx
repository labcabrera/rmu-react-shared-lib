import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { TemporaryModifier, temporaryModifierDaysLeft } from '../../api/temporary-modifier.dto';
import DeleteButton from '../../buttons/DeleteButton';
import { bonusColor, formatBonus } from '../character/StatPill';

/**
 * How long a modifier still lasts, as an i18n key and its params: the days left from the current campaign day or
 * `expired` (strategic), the day it expires when the current one is unknown, the days it lasts (tactical), or
 * `until removed`.
 */
export const temporaryModifierExpiry = (
  modifier: TemporaryModifier,
  currentGameDay?: number | null
): { key: string; params?: Record<string, unknown> } => {
  const expires = modifier.expiresGameDay;
  if (expires !== undefined && expires !== null) {
    const left = temporaryModifierDaysLeft(modifier, currentGameDay);
    if (left === null) return { key: 'temporary-modifier-until-day', params: { day: expires } };
    if (left <= 0) return { key: 'temporary-modifier-expired' };
    return { key: 'temporary-modifier-days-left', params: { count: left } };
  }
  if (modifier.days === null || modifier.days === undefined) return { key: 'temporary-modifier-until-removed' };
  return { key: 'temporary-modifier-days', params: { count: modifier.days } };
};

/**
 * Lasting morale and fear RR modifiers of a character or an actor (workspace spec 068, decision 19): kind, value,
 * source and expiry. `currentGameDay` gives the days left of a strategic modifier; `onRemove` shows a remove button.
 */
const TemporaryModifierList: FC<{
  modifiers: TemporaryModifier[];
  currentGameDay?: number | null;
  onRemove?: (modifier: TemporaryModifier) => void;
  /** Id of a modifier being removed: its button is disabled. */
  removingId?: string | null;
  /** Shows a line when there are none; by default the list renders nothing. */
  showEmpty?: boolean;
}> = ({ modifiers, currentGameDay, onRemove, removingId, showEmpty = false }) => {
  const { t } = useTranslation();

  if (modifiers.length === 0) {
    return showEmpty ? (
      <Typography variant="body2" color="text.secondary">
        {t('temporary-modifiers-empty')}
      </Typography>
    ) : null;
  }

  return (
    <Stack spacing={0.75} aria-label={t('temporary-modifiers')}>
      {modifiers.map((modifier) => {
        const expiry = temporaryModifierExpiry(modifier, currentGameDay);
        const expired = expiry.key === 'temporary-modifier-expired';
        return (
          <Stack
            key={modifier.id}
            direction="row"
            data-testid={`temporary-modifier-${modifier.id}`}
            sx={{ alignItems: 'center', gap: 1, opacity: expired ? 0.6 : 1 }}
          >
            <Chip size="small" variant="outlined" label={t(`temporary-modifier-kind-${modifier.kind}`)} />
            <Box component="span" sx={{ fontWeight: 700, color: bonusColor(modifier.value), minWidth: 32 }}>
              {formatBonus(modifier.value)}
            </Box>
            <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {t(`temporary-${modifier.source}`)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t(expiry.key, expiry.params ?? {})}
              </Typography>
            </Stack>
            {onRemove && (
              <DeleteButton
                tooltip="temporary-modifier-remove"
                disabled={removingId === modifier.id}
                onClick={() => onRemove(modifier)}
              />
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};

export default TemporaryModifierList;
