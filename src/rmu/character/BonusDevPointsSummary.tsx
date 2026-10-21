import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { Character } from '../../api/character.dto';
import { StrategicGame } from '../../api/strategic-game.dto';

/** Bonus development points spendable in a level when the game does not set `raceDevPointsPerLevel`. */
export const DEFAULT_RACE_DEV_POINTS_PER_LEVEL = 25;

/**
 * Bonus development points (race and game master) with the spent / limit of the level, and the flaw points.
 * Renders nothing when the character has none of them.
 */
const BonusDevPointsSummary: FC<{
  character: Character;
  strategicGame?: StrategicGame;
  /** Per level limit; by default the game's `powerLevel.raceDevPointsPerLevel` (25 when unset). */
  limit?: number;
}> = ({ character, strategicGame, limit }) => {
  const { t } = useTranslation();
  const { availableBonusDevPoints = 0, bonusDevPointsSpentThisLevel = 0, flawDevPoints = 0 } = character.experience;
  const levelLimit = limit ?? strategicGame?.powerLevel?.raceDevPointsPerLevel ?? DEFAULT_RACE_DEV_POINTS_PER_LEVEL;
  if (availableBonusDevPoints <= 0 && bonusDevPointsSpentThisLevel <= 0 && flawDevPoints <= 0) return null;
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}>
      <Typography variant="body2" color="text.secondary">
        {t('bonus-dev-points')}: <b>{availableBonusDevPoints}</b>
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {t('bonus-dev-points-spent-this-level')}: <b>{bonusDevPointsSpentThisLevel}</b> / {levelLimit}
      </Typography>
      {flawDevPoints > 0 && (
        <Typography variant="body2" color="text.secondary">
          {t('flaw-dev-points')}: <b>{flawDevPoints}</b>
        </Typography>
      )}
    </Stack>
  );
};

export default BonusDevPointsSummary;
