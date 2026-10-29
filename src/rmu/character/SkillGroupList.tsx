import React, { FC, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import TurnedInIcon from '@mui/icons-material/TurnedIn';
import {
  Box,
  ButtonBase,
  Chip,
  Collapse,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { CharacterSkill } from '../../api/character.dto';
import { formatBonus } from './StatPill';

const OTHER_CATEGORY = 'other';

type Group = { category: string; skills: CharacterSkill[]; best: number };

const skillLabel = (skill: CharacterSkill, t: (key: string) => string) =>
  skill.specialization ? `${t(skill.skillId)} (${t(skill.specialization)})` : t(skill.skillId);

/** Category of a skill: `categoryId` from strategic, `category` from older payloads. */
export const skillCategoryOf = (skill: Pick<CharacterSkill, 'categoryId' | 'category'>): string | undefined =>
  skill.categoryId ?? skill.category;

/**
 * The skills by their translated name, then by specialization, compared in `language`: the API sorts them by id, which
 * is the English name, so the order has to be computed again when the translations load or the language changes.
 */
export const sortSkillsByName = <S extends Pick<CharacterSkill, 'skillId' | 'specialization'>>(
  skills: S[],
  t: (key: string) => string,
  language?: string
): S[] => {
  const collator = new Intl.Collator(language, { sensitivity: 'base', numeric: true });
  return [...skills].sort(
    (a, b) =>
      collator.compare(t(a.skillId), t(b.skillId)) ||
      collator.compare(a.specialization ? t(a.specialization) : '', b.specialization ? t(b.specialization) : '')
  );
};

/** Shared column layout of the header-less rows: name, stats, ranks, total, actions. */
const rowColumns = { xs: 'minmax(0, 1fr) auto auto', sm: 'minmax(0, 1fr) 72px 56px 56px auto' };

const SkillRow: FC<{
  skill: CharacterSkill;
  onSelect?: (skill: CharacterSkill) => void;
  actions?: ReactNode;
}> = ({ skill, onSelect, actions }) => {
  const { t } = useTranslation();
  const flags = skill.professional ?? [];
  const content = (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: rowColumns,
        alignItems: 'center',
        columnGap: 1,
        width: '100%',
        px: 1.5,
        py: 0.75,
        textAlign: 'left',
      }}
    >
      <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          title={skillLabel(skill, t)}
          sx={{ minWidth: 0, color: skill.ranks > 0 ? 'text.primary' : 'text.secondary' }}
        >
          {skillLabel(skill, t)}
        </Typography>
        {/* Icons rather than chips, so that the name keeps the room (the same marks as the skill table) */}
        {flags.includes('professional') && (
          <Tooltip title={t('professional-skill')}>
            <TurnedInIcon color="primary" sx={{ fontSize: 16, flexShrink: 0 }} aria-label={t('professional-skill')} />
          </Tooltip>
        )}
        {flags.includes('knack') && (
          <Tooltip title={t('knack-skill')}>
            <StarIcon color="primary" sx={{ fontSize: 16, flexShrink: 0 }} aria-label={t('knack-skill')} />
          </Tooltip>
        )}
      </Stack>
      <Typography
        variant="caption"
        color="text.secondary"
        noWrap
        sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'right' }}
      >
        {skill.statistics.map((stat) => stat.toUpperCase()).join('/')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }} title={t('ranks')}>
        {skill.ranks}
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, textAlign: 'right', color: skill.totalBonus < 0 ? 'stat.negative' : 'text.primary' }}
      >
        {formatBonus(skill.totalBonus)}
      </Typography>
      {actions && <Box sx={{ display: { xs: 'none', sm: 'block' } }}>{actions}</Box>}
    </Box>
  );
  return onSelect ? (
    <ButtonBase
      onClick={() => onSelect(skill)}
      sx={{ display: 'block', width: '100%', '&:hover': { bgcolor: 'action.hover' } }}
    >
      {content}
    </ButtonBase>
  ) : (
    content
  );
};

/**
 * A character's skills grouped by category in collapsible groups, with search and a "developed only"
 * filter. Each group header shows its count and best total.
 */
const SkillGroupList: FC<{
  skills: CharacterSkill[];
  onSelect?: (skill: CharacterSkill) => void;
  /** Row actions (rank stepper, menu…), hidden on phones. */
  renderActions?: (skill: CharacterSkill) => ReactNode;
  /** Starts with only the skills that have ranks. */
  developedOnly?: boolean;
  /** Extra controls on the toolbar (add button…). */
  toolbar?: ReactNode;
  /** Hides the search box, for pages that already filter the skills. */
  searchable?: boolean;
}> = ({ skills, onSelect, renderActions, developedOnly: initialDevelopedOnly = false, toolbar, searchable = true }) => {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState('');
  const [developedOnly, setDevelopedOnly] = useState(initialDevelopedOnly);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo<Group[]>(() => {
    const term = search.trim().toLowerCase();
    const byCategory = new Map<string, CharacterSkill[]>();
    skills
      .filter((skill) => !developedOnly || skill.ranks > 0)
      .filter((skill) => !term || skillLabel(skill, t).toLowerCase().includes(term))
      .forEach((skill) => {
        const category = skillCategoryOf(skill) ?? OTHER_CATEGORY;
        byCategory.set(category, [...(byCategory.get(category) ?? []), skill]);
      });
    return [...byCategory.entries()]
      .map(([category, list]) => ({
        category,
        skills: sortSkillsByName(list, t, i18n.language),
        best: Math.max(...list.map((skill) => skill.totalBonus)),
      }))
      .sort((a, b) => t(a.category).localeCompare(t(b.category), i18n.language));
  }, [skills, search, developedOnly, t, i18n.language]);

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
        {searchable && (
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('search-skill')}
            size="small"
            sx={{ flex: 1, maxWidth: { sm: 320 } }}
            slotProps={{
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
        <FormControlLabel
          control={<Switch checked={developedOnly} onChange={(event) => setDevelopedOnly(event.target.checked)} />}
          label={t('only-developed')}
        />
        <Box sx={{ flex: 1 }} />
        {toolbar}
      </Stack>
      {groups.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          {t('not-found-skills')}
        </Typography>
      )}
      {/* Wide screens: groups flow in two columns, so rows do not stretch across the whole page. */}
      <Box sx={{ columns: { xs: 1, lg: 2 }, columnGap: 2 }}>
        {groups.map((group) => {
          const open = !collapsed[group.category];
          return (
            <Box
              key={group.category}
              sx={(theme) => ({
                breakInside: 'avoid',
                mb: 1.5,
                border: 1,
                borderColor: 'divider',
                borderRadius: `${theme.radius.md}px`,
                overflow: 'hidden',
              })}
            >
              <ButtonBase
                onClick={() => setCollapsed((state) => ({ ...state, [group.category]: open }))}
                aria-expanded={open}
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 1,
                  bgcolor: 'background.light',
                  gap: 1,
                }}
              >
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                  <ExpandMoreIcon
                    fontSize="small"
                    sx={(theme) => ({
                      transform: open ? 'none' : 'rotate(-90deg)',
                      transition: theme.transitions.create('transform'),
                    })}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {t(group.category)}
                  </Typography>
                  <Chip size="small" label={group.skills.length} />
                </Stack>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {formatBonus(group.best)}
                </Typography>
              </ButtonBase>
              <Collapse in={open} unmountOnExit>
                <Stack divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
                  {group.skills.map((skill) => (
                    <SkillRow key={skill.id} skill={skill} onSelect={onSelect} actions={renderActions?.(skill)} />
                  ))}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
};

export default SkillGroupList;
