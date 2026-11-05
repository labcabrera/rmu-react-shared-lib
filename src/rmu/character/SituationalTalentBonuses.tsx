import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Tooltip, Typography } from '@mui/material';
import { Character, CharacterSkill } from '../../api/character.dto';
import { situationalTraitsForSkill } from '../../api/talents-079.dto';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/**
 * The situational talents of the character that may help a skill (workspace spec 079, D3): Golden Throat, Empathy,
 * Animal Empathy and the sleepers. They are not in the total of the sheet: the game master ticks them on the maneuver.
 * Renders nothing when none applies; meant for the skill breakdown next to `SituationalSenseTraits`.
 */
const SituationalTalentBonuses: FC<{
  skill: Pick<CharacterSkill, 'skillId'> & { specialization?: string | null };
  traits: Character['traits'] | undefined;
}> = ({ skill, traits }) => {
  const { t } = useTranslation();
  const bonuses = situationalTraitsForSkill(skill, traits);
  if (bonuses.length === 0) return null;
  const nameOf = (traitId: string) => {
    const trait = (traits ?? []).find((each) => each.traitId === traitId);
    return t(trait?.traitName ?? traitId);
  };
  return (
    <Stack spacing={0.5} data-testid="situational-talent-bonuses">
      <Typography variant="caption" color="text.secondary">
        {t('situational-talent-bonuses')}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {bonuses.map((bonus) => (
          <Tooltip key={bonus.traitId} title={t(`situational-trait-${bonus.condition}`)}>
            <Chip
              size="small"
              variant="outlined"
              color={bonus.value < 0 ? 'error' : 'default'}
              label={`${nameOf(bonus.traitId)}${bonus.tier > 1 ? ` ${ROMAN[bonus.tier] ?? bonus.tier}` : ''} ${bonus.value > 0 ? '+' : ''}${bonus.value}`}
            />
          </Tooltip>
        ))}
      </Stack>
    </Stack>
  );
};

export default SituationalTalentBonuses;
