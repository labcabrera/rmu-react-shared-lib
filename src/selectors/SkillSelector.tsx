import React, { useState, useEffect, useMemo, FC, KeyboardEvent, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CheckIcon from '@mui/icons-material/Check';
import EditSquareIcon from '@mui/icons-material/EditSquare';
import SearchIcon from '@mui/icons-material/Search';
import { alpha, ButtonBase, Grid, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { fetchEnumerations } from '../api/enumerations.api';
import { fetchSkillCategories } from '../api/skill-category.api';
import { SkillCategory } from '../api/skill-category.dto';
import { fetchSkills } from '../api/skill.api';
import { Skill } from '../api/skill.dto';
import { fetchSpellLists, SPELL_LIST_CATALOG_MAX } from '../api/spell-list.api';
import CategorySeparator from '../display/CategorySeparator';

/** Specialization of the skills whose value is a spell list of rmu-api-spells (spec 029): the list code. */
export const SPELL_LIST_SPECIALIZATION = 'spell-list';

/** Specialization lists longer than this get their own filter field. */
const SPECIALIZATION_FILTER_FROM = 10;

/** A skill the entity already has: it is marked, and it cannot be chosen again (with that specialization). */
export type OwnedSkill = { skillId: string; specialization?: string | null; ranks?: number };

/** Lowercase text without accents, to compare names regardless of case and accents. */
const normalize = (text: string): string => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Spell lists of the given realms (all of them without realms), as code and name, ordered by name. */
async function fetchSpellListOptions(realms: string[] | undefined, auth: Parameters<typeof fetchSpellLists>[3]) {
  // One query per realm: a hybrid gets the lists of both, and each realm stays under the page size. Without realms,
  // the whole catalog in one page (spec 056, B-03)
  const byRealm = realms && realms.length > 0;
  const queries = byRealm ? realms.map((realm) => `realms==${realm}`) : [''];
  const size = byRealm ? 100 : SPELL_LIST_CATALOG_MAX;
  const pages = await Promise.all(queries.map((query) => fetchSpellLists(query, 0, size, auth)));
  const byCode = new Map<string, string>();
  pages.flatMap((page) => page.content).forEach((list) => list.code && byCode.set(list.code, list.name));
  return [...byCode.entries()].sort((a, b) => a[1].localeCompare(b[1]));
}

/**
 * Picks a skill and, when it has one, its specialization. The search field finds a skill by its translated name in
 * every category (Enter takes the first result); without a search, the skill is picked by category. Long
 * specialization lists have their own filter.
 */
const SkillSelector: FC<{
  realmId?: string;
  /** Realms of the character: the spell lists offered are those of these realms. */
  realms?: string[];
  /** Skills already owned: they show their ranks, and a skill (or a specialization) owned cannot be picked again. */
  owned?: OwnedSkill[];
  onSkillChange: (skillId: string | null) => void;
  onSpecializationChange: (specialization: string | null) => void;
  onError: (message: string) => void;
}> = ({ realmId, realms, owned = [], onSkillChange, onSpecializationChange, onError }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [availableCategories, setAvailableCategories] = useState<SkillCategory[]>();
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [availableSpecializations, setAvailableSpecializations] = useState<string[]>();
  // Names of the spell lists by code, to show the name of a list specialization
  const [spellListNames, setSpellListNames] = useState<Record<string, string>>({});
  // Names of the enumerations by key: the option shows its translation or the name of the catalog (spec 050)
  const [enumerationNames, setEnumerationNames] = useState<Record<string, string>>({});

  const [query, setQuery] = useState('');
  const [specializationQuery, setSpecializationQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory>();
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | null>(null);

  const ownedRanks = (skillId: string, specialization?: string | null): number | undefined => {
    const entry = owned.find((o) => o.skillId === skillId && (o.specialization ?? null) === (specialization ?? null));
    return entry ? (entry.ranks ?? 0) : undefined;
  };
  const isOwned = (skillId: string, specialization?: string | null) =>
    ownedRanks(skillId, specialization) !== undefined;
  // A skill with a specialization can be added again with another one
  const skillBlocked = (skill: Skill) => !skill.specialization && isOwned(skill.id);

  const skillName = (skill: Skill) => t(skill.id);
  const categoryName = (categoryId: string) => t(categoryId);

  const matches = useMemo(() => {
    const text = normalize(query);
    if (!text) return allSkills;
    const scored = allSkills
      .map((skill) => {
        const name = normalize(skillName(skill));
        if (name.startsWith(text)) return { skill, score: 0 };
        if (name.includes(text)) return { skill, score: 1 };
        if (skill.id.includes(text) || normalize(categoryName(skill.categoryId)).includes(text))
          return { skill, score: 2 };
        return null;
      })
      .filter((entry): entry is { skill: Skill; score: number } => entry !== null);
    return scored
      .sort((a, b) => a.score - b.score || skillName(a.skill).localeCompare(skillName(b.skill)))
      .map((entry) => entry.skill);
  }, [allSkills, query, t]);

  const searching = normalize(query) !== '';
  const categories = (availableCategories ?? []).filter(
    (category) => !searching || matches.some((skill) => skill.categoryId === category.id)
  );
  const skills = selectedCategory
    ? matches.filter((skill) => skill.categoryId === selectedCategory.id)
    : searching
      ? matches
      : [];
  const sortedSkills = searching ? skills : [...skills].sort((a, b) => skillName(a).localeCompare(skillName(b)));

  const specializations = useMemo(() => {
    const text = normalize(specializationQuery);
    const label = (value: string) =>
      spellListNames[value] ?? t(value, { defaultValue: enumerationNames[value] ?? value });
    const list = (availableSpecializations ?? []).filter((value) => !text || normalize(label(value)).includes(text));
    return list.sort((a, b) => label(a).localeCompare(label(b)));
  }, [availableSpecializations, specializationQuery, spellListNames, enumerationNames, t]);

  useEffect(() => {
    fetchSkillCategories('', 0, 100, auth)
      .then((data) => setAvailableCategories(data.content))
      .catch((error) => onError(error.message));
    fetchSkills('', 0, 500, auth)
      .then((data) => setAllSkills(data.content))
      .catch((error) => onError(error.message));
  }, [realmId]);

  useEffect(() => {
    onSpecializationChange(selectedSpecialization);
  }, [selectedSpecialization]);

  useEffect(() => {
    onSkillChange(selectedSkill ? selectedSkill.id : null);
    setSelectedSpecialization(null);
    setSpecializationQuery('');
    setAvailableSpecializations(undefined);
    if (selectedSkill?.specialization) {
      if (selectedSkill.specialization === SPELL_LIST_SPECIALIZATION) {
        fetchSpellListOptions(realms, auth)
          .then((options) => {
            setSpellListNames(Object.fromEntries(options));
            setAvailableSpecializations(options.map(([code]) => code));
          })
          .catch((err) => onError(err.message));
      } else {
        const realmQuery = realmId ? `;(realmId==${realmId},realmId==null)` : ``;
        fetchEnumerations(`category==${selectedSkill.specialization}${realmQuery}`, 0, 200, auth)
          .then((response) => {
            // The key is stored; the option shows its translation or the name of the catalog
            setEnumerationNames(Object.fromEntries(response.content.map((e) => [e.key, e.name ?? e.key])));
            setAvailableSpecializations(response.content.map((e) => e.key));
          })
          .catch((err) => onError(err.message));
      }
    }
  }, [selectedSkill, auth]);

  const onCategoryChange = (category: SkillCategory) => {
    // Choosing the selected category again goes back to every result of the search
    setSelectedCategory(category === selectedCategory && searching ? undefined : category);
    setSelectedSkill(null);
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    setSelectedCategory(undefined);
    if (selectedSkill && value) setSelectedSkill(null);
  };

  const onSearchKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const first = sortedSkills.find((skill) => !skillBlocked(skill));
    if (first) setSelectedSkill(first);
  };

  const ownedAdornment = (ranks: number | undefined) =>
    ranks === undefined ? null : (
      <Typography component="span" variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
        {t('skill-owned', { count: ranks })}
      </Typography>
    );

  if (!availableCategories) return <p>{t('loading')}</p>;

  return (
    <Grid container spacing={2} sx={{ mt: 1 }}>
      <Grid size={12}>
        <TextField
          autoFocus
          fullWidth
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={onSearchKeyDown}
          placeholder={t('search-skill')}
          slotProps={{
            htmlInput: { 'aria-label': t('search-skill') },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <CategorySeparator text={t('skill-category')} />
        <SelectionList
          value={selectedCategory}
          options={categories}
          onChange={onCategoryChange}
          getKey={(value) => value.id}
          formatter={(value) => categoryName(value.id)}
          getCount={(value) => matches.filter((skill) => skill.categoryId === value.id).length}
          emptyText={t('no-results')}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }}>
        {(selectedCategory || searching) && (
          <>
            <CategorySeparator text={searching ? t('results-count', { count: sortedSkills.length }) : t('skill')} />
            <SelectionList
              value={selectedSkill}
              options={sortedSkills}
              onChange={setSelectedSkill}
              getKey={(value) => value.id}
              formatter={(value) => skillName(value)}
              secondary={searching && !selectedCategory ? (value) => categoryName(value.categoryId) : undefined}
              isDisabled={skillBlocked}
              endAdornment={(value) => (
                <>
                  {!value.specialization && ownedAdornment(ownedRanks(value.id))}
                  {value.specialization ? <EditSquareIcon fontSize="small" sx={{ color: 'text.secondary' }} /> : null}
                </>
              )}
              emptyText={t('no-results')}
            />
          </>
        )}
        {selectedSkill && availableSpecializations && (
          <>
            <CategorySeparator
              text={selectedSkill.specializationOptional ? t('specialization-optional') : t('specialization')}
            />
            {availableSpecializations.length > SPECIALIZATION_FILTER_FROM && (
              <TextField
                fullWidth
                value={specializationQuery}
                onChange={(event) => setSpecializationQuery(event.target.value)}
                placeholder={t('search-specialization')}
                sx={{ mb: 1 }}
                slotProps={{
                  htmlInput: { 'aria-label': t('search-specialization') },
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            )}
            <SelectionList
              value={selectedSpecialization}
              options={specializations}
              // An optional specialization can be cleared by choosing it again (spec 037).
              onChange={(value) =>
                setSelectedSpecialization(
                  selectedSkill.specializationOptional && value === selectedSpecialization ? null : value
                )
              }
              getKey={(value) => value}
              formatter={(value) =>
                spellListNames[value] ?? t(value, { defaultValue: enumerationNames[value] ?? value })
              }
              isDisabled={(value) => isOwned(selectedSkill.id, value)}
              endAdornment={(value) => ownedAdornment(ownedRanks(selectedSkill.id, value))}
              emptyText={t('no-results')}
            />
          </>
        )}
      </Grid>
    </Grid>
  );
};

type SelectionListProps<T> = {
  value: T | null | undefined;
  options: T[];
  onChange: (value: T) => void;
  getKey: (value: T) => string;
  formatter: (value: T) => ReactNode;
  /** Second line under the name (the category of a search result). */
  secondary?: (value: T) => ReactNode;
  getCount?: (value: T) => number;
  endAdornment?: (value: T) => ReactNode;
  /** Options shown but not selectable (already owned). */
  isDisabled?: (value: T) => boolean;
  emptyText?: string;
};

const SelectionList = <T,>({
  value,
  options,
  onChange,
  getKey,
  formatter,
  secondary,
  getCount,
  endAdornment,
  isDisabled,
  emptyText,
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
        {options.length === 0 && emptyText && (
          <Typography variant="body2" sx={{ px: 1.5, py: 1.25, color: 'text.secondary' }}>
            {emptyText}
          </Typography>
        )}
        {options.map((option) => {
          const selected = option === value;
          const disabled = isDisabled?.(option) ?? false;
          const count = getCount?.(option);
          const adornment = endAdornment?.(option);
          const subtitle = secondary?.(option);

          return (
            <ButtonBase
              key={getKey(option)}
              onClick={() => onChange(option)}
              disabled={disabled}
              aria-pressed={selected}
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
                opacity: disabled ? 0.5 : 1,
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
              <Stack sx={{ minWidth: 0 }}>
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
                {subtitle && (
                  <Typography component="span" variant="caption" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                  </Typography>
                )}
              </Stack>
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
