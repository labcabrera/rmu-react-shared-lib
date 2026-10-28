import React, { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  alpha,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { Character } from '../api/character.dto';
import EntityAvatar from '../avatars/EntityAvatar';

/** A character (or an actor of a tactical game) as the picker shows it, independent of the API it comes from. */
export interface CharacterOption {
  id: string;
  name: string;
  imageUrl?: string | null;
  factionId?: string;
  factionName?: string;
  /** Colour of its faction: a stripe on the card. */
  color?: string;
  /** Line under the name: profession and level, Medicine bonus… */
  secondary?: string;
  /** States shown as chips: down, stunned… */
  badges?: string[];
  /** Not selectable: shown faded, with the reason instead of the secondary line. */
  disabledReason?: string;
  /** Not selectable, with this text as a tooltip (e.g. locked once the game started). */
  disabledHint?: string;
  /** Shown instead of the avatar, for entries that are not characters (the armory of a faction). */
  icon?: ReactNode;
}

/** Who can be chosen, seen from a faction: its own characters, the others' or everyone. */
export type CharacterRelation = 'friends' | 'enemies' | 'all';

export type CharacterPickerVariant = 'auto' | 'cards' | 'compact';

/** With `variant="auto"`, more options than this are shown as a compact list (spec 038, decision 2). */
export const CHARACTER_PICKER_COMPACT_FROM = 12;
/** More cards than this get a search field (spec 038, decision 3). */
export const CHARACTER_PICKER_SEARCH_FROM = 8;

/** Options related to `factionId` as asked: friends share it, enemies don't. Without a faction nothing is filtered. */
export const filterByRelation = (
  options: CharacterOption[],
  relation: CharacterRelation,
  factionId?: string
): CharacterOption[] => {
  if (relation === 'all' || !factionId) return options;
  return options.filter((option) => (option.factionId === factionId) === (relation === 'friends'));
};

/** Option of a character of the strategic API. */
export const characterOption = (character: Character, extra: Partial<CharacterOption> = {}): CharacterOption => ({
  id: character.id,
  name: character.name,
  imageUrl: character.imageUrl,
  factionId: character.faction?.id,
  factionName: character.faction?.name,
  ...extra,
});

/** Image of a character, or its initials when it has none. Decorative: the name is always next to it. */
export const CharacterAvatar: FC<{
  option: Pick<CharacterOption, 'name' | 'imageUrl' | 'icon'>;
  size?: number;
  variant?: 'circular' | 'rounded' | 'square';
  faded?: boolean;
}> = ({ option, size = 40, variant = 'rounded', faded = false }) => (
  <EntityAvatar
    name={option.name}
    imageUrl={option.imageUrl}
    icon={option.icon}
    size={size}
    variant={variant}
    faded={faded}
  />
);

type CommonProps = {
  options: CharacterOption[];
  /** Which options to offer, seen from `factionId`; defaults to everyone. */
  relation?: CharacterRelation;
  /** Faction of the point of view: the acting actor's, or the character's. */
  factionId?: string;
  /** Ids never offered: the acting actor, the target… */
  exclude?: string[];
  /** A "show all" switch that widens `friends` or `enemies` to everyone. */
  allowShowAll?: boolean;
  /** Right side of each card: DB, AT and hit points of a target… */
  renderDetails?: (option: CharacterOption) => ReactNode;
  /** Cards grouped under the name of their faction; in the compact list, groups of options. */
  groupByFaction?: boolean;
  /** Entries that are not characters, offered first and never filtered by relation (the armory of a faction). */
  extraOptions?: CharacterOption[];
  variant?: CharacterPickerVariant;
  label?: string;
  emptyText?: string;
  disabled?: boolean;
  /** Options whose change is being saved: a spinner instead of their check. */
  pendingIds?: string[];
};

type SingleProps = CommonProps & {
  mode?: 'single';
  value: string | null | undefined;
  /** `null` only when the compact list is `clearable`. */
  onChange: (id: string | null) => void;
  clearable?: boolean;
};

type MultipleProps = CommonProps & {
  mode: 'multiple';
  value: string[];
  onChange: (ids: string[]) => void;
};

export type CharacterPickerProps = SingleProps | MultipleProps;

const selectable = (option: CharacterOption) => !option.disabledReason && !option.disabledHint;

/** Mark of a multiple choice card: checked, unchecked, or a spinner while it is saved. */
const SelectionMark: FC<{ selected: boolean; pending: boolean }> = ({ selected, pending }) => {
  if (pending) return <CircularProgress size={20} />;
  return selected ? (
    <CheckCircleIcon color="primary" sx={{ bgcolor: 'background.paper', borderRadius: '50%' }} />
  ) : (
    <RadioButtonUncheckedIcon sx={{ color: 'text.disabled' }} />
  );
};

const CardContent: FC<{
  option: CharacterOption;
  renderDetails?: (option: CharacterOption) => ReactNode;
  mark?: ReactNode;
}> = ({ option, renderDetails, mark }) => (
  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', minWidth: 0 }}>
    {option.color && <Box sx={{ width: 4, alignSelf: 'stretch', borderRadius: 1, bgcolor: option.color }} />}
    <CharacterAvatar option={option} size={56} faded={!!option.disabledReason} />
    <Box sx={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
        {option.name}
      </Typography>
      {option.disabledReason ? (
        <Typography variant="caption" color="error.main" noWrap component="div">
          {option.disabledReason}
        </Typography>
      ) : (
        option.secondary && (
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {option.secondary}
          </Typography>
        )
      )}
      {option.badges && option.badges.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.25 }}>
          {option.badges.map((badge) => (
            <Chip key={badge} size="small" color="warning" label={badge} />
          ))}
        </Stack>
      )}
    </Box>
    {renderDetails?.(option)}
    {mark && <Box sx={{ alignSelf: 'flex-start' }}>{mark}</Box>}
  </Stack>
);

/** One option as a card: a radio in single mode, a checkbox in multiple mode. */
export const CharacterCard: FC<{
  option: CharacterOption;
  role?: 'radio' | 'checkbox';
  selected?: boolean;
  pending?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  renderDetails?: (option: CharacterOption) => ReactNode;
}> = ({ option, role, selected = false, pending = false, disabled = false, onClick, renderDetails }) => {
  const mark = role === 'checkbox' && !option.disabledReason && <SelectionMark selected={selected} pending={pending} />;
  if (!onClick) {
    return (
      <Box sx={{ px: 1.25, py: 1 }}>
        <CardContent option={option} renderDetails={renderDetails} />
      </Box>
    );
  }
  const card = (
    <ButtonBase
      role={role}
      aria-checked={selected}
      aria-label={option.name}
      disabled={disabled || !selectable(option)}
      onClick={onClick}
      sx={(theme) => ({
        width: '100%',
        height: '100%',
        px: 1.25,
        py: 1,
        borderRadius: `${theme.radius.sm}px`,
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'background.light',
        opacity: option.disabledReason ? 0.7 : 1,
        transition: 'border-color 120ms, background-color 120ms',
      })}
    >
      <CardContent option={option} renderDetails={renderDetails} mark={mark || undefined} />
    </ButtonBase>
  );
  return option.disabledHint ? (
    <Tooltip title={option.disabledHint}>
      <Box sx={{ height: '100%' }}>{card}</Box>
    </Tooltip>
  ) : (
    card
  );
};

/** Options grouped by faction, in the order they come. */
const byFaction = (options: CharacterOption[]) => {
  const groups: { key: string; name?: string; color?: string; options: CharacterOption[] }[] = [];
  options.forEach((option) => {
    const key = option.factionId ?? '';
    let group = groups.find((each) => each.key === key);
    if (!group) {
      group = { key, name: option.factionName, color: option.color, options: [] };
      groups.push(group);
    }
    group.options.push(option);
  });
  return groups;
};

/** Cards fill the width; they are wider when they carry details on the right. */
const cardGrid = (details: boolean) => ({
  display: 'grid',
  gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${details ? 360 : 280}px), 1fr))`,
  gap: 1,
});

/**
 * Chooses one or several characters (spec 038): cards with their avatar, or a compact list with search for long
 * lists. The options can be narrowed to the friends or the enemies of a faction, with a "show all" switch.
 */
const CharacterPicker: FC<CharacterPickerProps> = (props) => {
  const {
    options,
    relation = 'all',
    factionId,
    exclude = [],
    allowShowAll = false,
    renderDetails,
    groupByFaction = false,
    extraOptions = [],
    variant = 'auto',
    label,
    emptyText,
    disabled = false,
    pendingIds = [],
  } = props;
  const { t } = useTranslation();
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState('');
  const singleValue = props.mode === 'multiple' ? null : props.value;
  const [changing, setChanging] = useState(!singleValue);

  const related = filterByRelation(options, showAll ? 'all' : relation, factionId);
  const visible = [...extraOptions, ...related].filter((option) => !exclude.includes(option.id));
  const compact = variant === 'compact' || (variant === 'auto' && visible.length > CHARACTER_PICKER_COMPACT_FROM);
  const all = [...extraOptions, ...options];
  const selectedIds = props.mode === 'multiple' ? props.value : singleValue ? [singleValue] : [];
  const isSelected = (id: string) => selectedIds.includes(id);

  const choose = (id: string) => {
    if (props.mode === 'multiple') {
      props.onChange(isSelected(id) ? props.value.filter((each) => each !== id) : [...props.value, id]);
    } else {
      props.onChange(id);
      setChanging(false);
    }
  };

  const showAllSwitch = allowShowAll && relation !== 'all' && (
    <FormControlLabel
      control={<Switch size="small" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />}
      label={<Typography variant="caption">{t('show-all-actors')}</Typography>}
    />
  );

  if (compact) {
    const optionContent = (option: CharacterOption) => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
        <CharacterAvatar option={option} size={28} faded={!!option.disabledReason} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {option.name}
          </Typography>
          {(option.disabledReason || option.secondary) && (
            <Typography variant="caption" color={option.disabledReason ? 'error.main' : 'text.secondary'} noWrap>
              {option.disabledReason ?? option.secondary}
            </Typography>
          )}
        </Box>
      </Stack>
    );
    const common = {
      size: 'small' as const,
      // Autocomplete groups only consecutive options, so each faction's options go together.
      options: groupByFaction ? byFaction(visible).flatMap((group) => group.options) : visible,
      disabled,
      fullWidth: true,
      getOptionLabel: (option: CharacterOption) => option.name,
      getOptionDisabled: (option: CharacterOption) => !selectable(option),
      isOptionEqualToValue: (option: CharacterOption, current: CharacterOption) => option.id === current.id,
      groupBy: groupByFaction ? (option: CharacterOption) => option.factionName ?? '' : undefined,
      noOptionsText: emptyText ?? t('character-picker-empty'),
      renderOption: (
        { key, ...liProps }: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
        option: CharacterOption
      ) => (
        <li key={key} {...liProps}>
          {optionContent(option)}
        </li>
      ),
    };
    return (
      <Stack spacing={0.5}>
        {showAllSwitch}
        {props.mode === 'multiple' ? (
          <Autocomplete
            {...common}
            multiple
            disableCloseOnSelect
            value={props.value.map((id) => all.find((option) => option.id === id)).filter((o) => !!o)}
            onChange={(_, value) => props.onChange(value.map((option) => option.id))}
            renderValue={(value, getItemProps) =>
              value.map((option, index) => {
                const { key, ...itemProps } = getItemProps({ index });
                return (
                  <Chip
                    key={key}
                    {...itemProps}
                    size="small"
                    label={option.name}
                    avatar={<CharacterAvatar option={option} size={20} variant="circular" />}
                  />
                );
              })
            }
            renderInput={(params) => <TextField {...params} label={label} />}
          />
        ) : (
          <Autocomplete
            {...common}
            disableClearable={!props.clearable}
            value={all.find((option) => option.id === props.value) ?? (null as unknown as CharacterOption)}
            onChange={(_, option) => props.onChange(option?.id ?? null)}
            renderInput={(params) => {
              const selected = all.find((option) => option.id === props.value);
              return (
                <TextField
                  {...params}
                  label={label}
                  slotProps={{
                    ...params.slotProps,
                    input: {
                      ...params.slotProps.input,
                      startAdornment: selected && (
                        <InputAdornment position="start">
                          <CharacterAvatar option={selected} size={24} variant="circular" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              );
            }}
          />
        )}
      </Stack>
    );
  }

  const selectedOption = singleValue ? all.find((option) => option.id === singleValue) : undefined;
  if (props.mode !== 'multiple' && selectedOption && !changing) {
    return (
      <Stack spacing={0.5}>
        {label && (
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        )}
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CharacterCard option={selectedOption} renderDetails={renderDetails} />
          </Box>
          <Button size="small" disabled={disabled} onClick={() => setChanging(true)}>
            {t('change')}
          </Button>
        </Stack>
      </Stack>
    );
  }

  const searchable = visible.length > CHARACTER_PICKER_SEARCH_FROM;
  const term = query.trim().toLowerCase();
  const shown = searchable && term ? visible.filter((option) => option.name.toLowerCase().includes(term)) : visible;
  const role = props.mode === 'multiple' ? 'checkbox' : 'radio';
  const cards = (list: CharacterOption[]) => (
    <Box sx={cardGrid(!!renderDetails)}>
      {list.map((option) => (
        <CharacterCard
          key={option.id}
          option={option}
          role={role}
          selected={isSelected(option.id)}
          pending={pendingIds.includes(option.id)}
          disabled={disabled}
          onClick={() => choose(option.id)}
          renderDetails={renderDetails}
        />
      ))}
    </Box>
  );

  return (
    <Stack spacing={1}>
      {(label || showAllSwitch) && (
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {label && (
            <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
              {label}
            </Typography>
          )}
          {showAllSwitch}
        </Stack>
      )}
      {searchable && (
        <TextField
          size="small"
          label={t('search')}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          sx={{ maxWidth: 320 }}
        />
      )}
      <Box
        role={props.mode === 'multiple' ? 'group' : 'radiogroup'}
        aria-label={label}
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        {shown.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {emptyText ?? t('character-picker-empty')}
          </Typography>
        ) : groupByFaction ? (
          byFaction(shown).map((group) => (
            <Box key={group.key}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
                {group.color && <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: group.color }} />}
                <Typography variant="subtitle2">{group.name ?? group.key}</Typography>
              </Stack>
              {cards(group.options)}
            </Box>
          ))
        ) : (
          cards(shown)
        )}
      </Box>
    </Stack>
  );
};

export default CharacterPicker;
