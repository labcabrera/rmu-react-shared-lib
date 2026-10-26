import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import { Box, Button, Chip, Collapse, Stack, Tooltip, Typography } from '@mui/material';
import { KeyValue } from '../api/common.dto';
import { MANEUVER_DIFFICULTIES } from '../api/constants';
import { localizedText, SkillDifficultyGuide } from '../api/skill-difficulty.dto';
import { formatBonus } from '../rmu/character/StatPill';

/**
 * Maneuver difficulty as a wrap of chips with their bonus. With a `guide` (spec 037) each chip with an example shows
 * it as a tooltip, the example of the chosen difficulty is shown below, and the whole scale of the skill can be opened
 * (a click on one of its rows chooses that difficulty).
 */
const DifficultyPicker: FC<{
  value: string | null | undefined;
  onChange: (difficulty: string) => void;
  /** Marks the actor's base difficulty (movement). */
  base?: string;
  /** Difficulties to offer, e.g. from the maneuver modifiers listing; defaults to Table 5-2. */
  options?: KeyValue[];
  /** Example difficulties of the skill (or the general scale). */
  guide?: SkillDifficultyGuide | null;
}> = ({ value, onChange, base, options = MANEUVER_DIFFICULTIES, guide }) => {
  const { t, i18n } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const example = (key: string | null | undefined) => guide?.examples.find((each) => each.difficulty === key);
  const text = (key: string | null | undefined) => localizedText(example(key)?.text, i18n.language);
  const label = (key: string) => {
    const option = options.find((each) => each.key === key);
    return `${t(`difficulty-${key}`)}${option ? ` ${formatBonus(option.value)}` : ''}`;
  };
  const source = guide?.fallback ? t('difficulty-guide-general') : t('difficulty-guide');
  const context = localizedText(guide?.context, i18n.language);

  return (
    <Box role="radiogroup" aria-label={t('difficulty')}>
      <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.5 }}>
        {t('difficulty')}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
        {options.map((option) => {
          const selected = option.key === value;
          const chip = (
            <Chip
              key={option.key}
              role="radio"
              aria-checked={selected}
              label={label(option.key)}
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : option.key === base ? 'outlined' : 'filled'}
              onClick={() => onChange(option.key)}
            />
          );
          const tooltip = text(option.key);
          return tooltip ? (
            <Tooltip key={option.key} title={tooltip} enterDelay={400} describeChild>
              {chip}
            </Tooltip>
          ) : (
            chip
          );
        })}
      </Box>
      {guide && (
        <Box
          data-testid="difficulty-guide"
          sx={{
            mt: 1,
            pl: 1.5,
            py: 0.75,
            borderLeft: 3,
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
            borderRadius: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', minWidth: 0 }}>
              <MenuBookOutlinedIcon fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary" noWrap>
                {context ? `${source} · ${context}` : source}
              </Typography>
            </Stack>
            <Button size="small" onClick={() => setShowAll(!showAll)}>
              {showAll ? t('difficulty-guide-hide') : t('difficulty-guide-show-all')}
            </Button>
          </Stack>
          {value && (
            <Typography variant="body2" sx={{ pr: 1, color: text(value) ? 'text.primary' : 'text.secondary' }}>
              {text(value) ? (
                <>
                  <Box component="span" sx={{ fontWeight: 600 }}>{`${t(`difficulty-${value}`)}: `}</Box>
                  {text(value)}
                </>
              ) : (
                t('difficulty-guide-no-example')
              )}
            </Typography>
          )}
          <Collapse in={showAll} unmountOnExit>
            <Stack spacing={0.5} sx={{ mt: 1, pr: 1, pb: 0.5 }}>
              {guide.examples.map((each) => (
                <Box
                  key={each.difficulty}
                  role="button"
                  tabIndex={0}
                  onClick={() => onChange(each.difficulty)}
                  onKeyDown={(event) => event.key === 'Enter' && onChange(each.difficulty)}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '150px 1fr' },
                    gap: 1,
                    p: 0.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    bgcolor: each.difficulty === value ? 'action.selected' : 'transparent',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {label(each.difficulty)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {localizedText(each.text, i18n.language)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};

export default DifficultyPicker;
