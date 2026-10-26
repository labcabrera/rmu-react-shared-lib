import React, { useState, useEffect, FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CheckIcon from '@mui/icons-material/Check';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import { alpha, ButtonBase, Grid, Paper, Stack, Typography } from '@mui/material';
import { fetchEnumerations } from '../api/enumerations.api';
import { fetchSkillCategories } from '../api/skill-category.api';
import { SkillCategory } from '../api/skill-category.dto';
import { fetchSkills } from '../api/skill.api';
import { fetchSpellLists } from '../api/spell-list.api';
import { Skill } from '../api/skill.dto';
import CategorySeparator from '../display/CategorySeparator';

/** Specialization of the skills whose value is a spell list of rmu-api-spells (spec 029): the list code. */
export const SPELL_LIST_SPECIALIZATION = 'spell-list';

/** Spell lists of the given realms (all of them without realms), as code and name, ordered by name. */
async function fetchSpellListOptions(realms: string[] | undefined, auth: Parameters<typeof fetchSpellLists>[3]) {
  // One query per realm: a hybrid gets the lists of both, and each realm stays under the page size
  const queries = realms && realms.length > 0 ? realms.map((realm) => `realms==${realm}`) : [''];
  const pages = await Promise.all(queries.map((query) => fetchSpellLists(query, 0, 100, auth)));
  const byCode = new Map<string, string>();
  pages.flatMap((page) => page.content).forEach((list) => list.code && byCode.set(list.code, list.name));
  return [...byCode.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

const SkillSelector: FC<{
  realmId?: string;
  /** Realms of the character: the spell lists offered are those of these realms. */
  realms?: string[];
  onSkillChange: (skillId: string | null) => void;
  onSpecializationChange: (specialization: string | null) => void;
  onError: (message: string) => void;
}> = ({ realmId, realms, onSkillChange, onSpecializationChange, onError }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [availableCategories, setAvailableCategories] = useState<SkillCategory[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();
  // Names of the spell lists by code, to show the name of a list specialization
  const [spellListNames, setSpellListNames] = useState<Record<string, string>>({});

  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const bindSkillCategories = () => {
    fetchSkillCategories('', 0, 100, auth)
      .then((data) => setAvailableCategories(data.content))
      .catch((error) => onError(error.message));
  };

  const bindAllSkills = () => {
    fetchSkills('', 0, 500, auth)
      .then((data) => setAllSkills(data.content))
      .catch((error) => onError(error.message));
  };

  const bindSkills = (categoryId: string) => {
    fetchSkills(`categoryId==${categoryId}`, 0, 100, auth)
      .then((data) => setAvailableSkills(data.content))
      .catch((error) => onError(error.message));
  };

  useEffect(() => {
    onSpecializationChange(selectedSpecialization);
  }, [selectedSpecialization]);

  useEffect(() => {
    onSkillChange(selectedSkill ? selectedSkill.id : null);
    setSelectedSpecialization(null);
    if (selectedSkill) {
      if (!selectedSkill.specialization) {
        setAvailableSpecializations(undefined);
      } else if (selectedSkill.specialization === SPELL_LIST_SPECIALIZATION) {
        fetchSpellListOptions(realms, auth)
          .then((options) => {
            setSpellListNames(Object.fromEntries(options));
            setAvailableSpecializations(options.map(([code]) => code));
          })
          .catch((err) => onError(err.message));
      } else {
        const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : ``;
        fetchEnumerations(`category==${selectedSkill.specialization}${realmQuery}`, 0, 100, auth)
          .then((response) => setAvailableSpecializations(response.content.map((e) => e.key)))
          .catch((err) => onError(err.message));
      }
    }
  }, [selectedSkill, auth]);

  useEffect(() => {
    setAvailableSpecializations(undefined);
    setSelectedSkill(null);
    setSelectedSpecialization(null);
    if (selectedCategory) {
      bindSkills(selectedCategory.id);
    }
  }, [selectedCategory]);

  useEffect(() => {
    bindSkillCategories();
    bindAllSkills();
  }, [realmId]);

  if (!availableCategories) return <p>{t('loading')}</p>;

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <CategorySeparator text={t('skill-category')} />
        <CategoryList
          value={selectedCategory}
          options={availableCategories}
          onChange={setSelectedCategory}
          getKey={(value) => value.id}
          formatter={(value) => t(value.id)}
          getCount={(value) => allSkills.filter((skill) => skill.categoryId === value.id).length}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {selectedCategory && (
          <>
            <CategorySeparator text={t('skill')} />
            <SelectionList
              value={selectedSkill}
              options={availableSkills}
              onChange={setSelectedSkill}
              getKey={(value) => value.id}
              formatter={(value) => t(value.id)}
              endAdornment={(value) =>
                value.specialization ? <EditSquareIcon fontSize="small" sx={{ color: 'text.secondary' }} /> : null
              }
            />
          </>
        )}
        {selectedSkill && availableSpecializations && (
          <>
            <CategorySeparator
              text={selectedSkill.specializationOptional ? t('specialization-optional') : t('specialization')}
            />
            <SelectionList
              value={selectedSpecialization}
              options={availableSpecializations}
              // An optional specialization can be cleared by choosing it again (spec 037).
              onChange={(value) =>
                setSelectedSpecialization(
                  selectedSkill.specializationOptional && value === selectedSpecialization ? null : value
                )
              }
              getKey={(value) => value}
              formatter={(value) => spellListNames[value] ?? t(value)}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};

type CategoryListProps<T> = {
  value: T | null | undefined;
  options: T[];
  onChange: (value: T) => void;
  getKey: (value: T) => string;
  formatter: (value: T) => ReactNode;
  getCount: (value: T) => number;
};

const CategoryList = <T,>({ value, options, onChange, getKey, formatter, getCount }: CategoryListProps<T>) => {
  return (
    <SelectionList
      value={value}
      options={options}
      onChange={onChange}
      getKey={getKey}
      formatter={formatter}
      getCount={getCount}
    />
  );
};

type SelectionListProps<T> = {
  value: T | null | undefined;
  options: T[];
  onChange: (value: T) => void;
  getKey: (value: T) => string;
  formatter: (value: T) => ReactNode;
  getCount?: (value: T) => number;
  endAdornment?: (value: T) => ReactNode;
};

const SelectionList = <T,>({
  value,
  options,
  onChange,
  getKey,
  formatter,
  getCount,
  endAdornment,
}: SelectionListProps<T>) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        maxHeight: 440,
        overflow: 'auto',
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.36),
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <Stack>
        {options.map((option) => {
          const selected = option === value;
          const count = getCount?.(option);
          const adornment = endAdornment?.(option);

          return (
            <ButtonBase
              key={getKey(option)}
              onClick={() => onChange(option)}
              sx={(theme) => ({
                display: 'flex',
                width: '100%',
                minHeight: 42,
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                px: 1.5,
                py: 1,
                color: selected ? 'primary.light' : 'text.primary',
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                borderBottom: `1px solid ${theme.palette.divider}`,
                borderLeft: `3px solid ${selected ? theme.palette.primary.light : 'transparent'}`,
                textAlign: 'left',
                transition: theme.transitions.create(['background-color', 'border-color', 'color'], {
                  duration: theme.transitions.duration.shortest,
                }),
                '&:last-of-type': {
                  borderBottom: 0,
                },
                '&:hover': {
                  bgcolor: selected ? alpha(theme.palette.primary.main, 0.24) : alpha(theme.palette.primary.main, 0.08),
                },
              })}
            >
              <Typography
                component="span"
                variant="body2"
                sx={{
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatter(option)}
              </Typography>
              <Stack
                component="span"
                direction="row"
                spacing={1}
                sx={{
                  alignItems: 'center',
                  flex: 'none',
                  color: selected ? 'primary.light' : 'text.secondary',
                }}
              >
                {adornment}
                {count !== undefined && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={(theme) => ({
                      minWidth: 26,
                      height: 22,
                      px: 0.75,
                      borderRadius: 11,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: selected ? 'primary.light' : 'text.secondary',
                      bgcolor: selected ? alpha(theme.palette.primary.main, 0.18) : 'action.hover',
                    })}
                  >
                    {count}
                  </Typography>
                )}
                {selected && <CheckIcon fontSize="small" />}
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>
    </Paper>
  );
};

export default SkillSelector;
