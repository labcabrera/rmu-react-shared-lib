import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import { Character, CharacterSkill, CharacterTrait } from '../../api/character.dto';
import { isSenseTrait, SENSE_SKILL_IDS } from '../../api/combat-talents.dto';

const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/** The sense talents and flaws of a character (workspace spec 076). */
export const senseTraitsOf = (traits: CharacterTrait[] | undefined): CharacterTrait[] =>
  (traits ?? []).filter((trait) => !trait.missingReference && isSenseTrait(trait.traitId));

/**
 * The sense talents and flaws of the character on a Perception or Tracking skill (workspace spec 076, decision C8):
 * they are situational, applied in the roll of the maneuver by the sense used, so the total of the sheet leaves them
 * out. Renders nothing for other skills or without sense traits; meant for the skill breakdown or a tooltip.
 */
const SituationalSenseTraits: FC<{
  skill: Pick<CharacterSkill, 'skillId'>;
  traits: Character['traits'] | undefined;
}> = ({ skill, traits }) => {
  const { t } = useTranslation();
  if (!SENSE_SKILL_IDS.includes(skill.skillId)) return null;
  const senses = senseTraitsOf(traits);
  if (senses.length === 0) return null;
  return (
    <Stack spacing={0.5} data-testid="situational-sense-traits">
      <Typography variant="caption" color="text.secondary">
        {t('situational-sense-traits')}
      </Typography>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {senses.map((trait) => (
          <Chip
            key={trait.traitId}
            size="small"
            variant="outlined"
            label={trait.tier ? `${t(trait.traitName)} ${ROMAN[trait.tier] ?? trait.tier}` : t(trait.traitName)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default SituationalSenseTraits;
