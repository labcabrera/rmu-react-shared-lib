import React, { KeyboardEvent, ReactNode, useId, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Box,
  Chip,
  FormHelperText,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EntityAvatar, { avatarSize } from '../avatars/EntityAvatar';
import { EntityKind } from '../config/default-images';

export { default as EntityAvatar } from '../avatars/EntityAvatar';

/** One choice of an EntityPicker, independent of the entity it comes from. */
export interface EntityOption<T = unknown> {
  id: string;
  /** Text shown, already translated. */
  label: string;
  /** Its image; the fallback of the picker's `kind`, then the initials, when it has none. */
  imageUrl?: string | null;
  /** Second line (select variant) or tooltip (tiles). */
  secondary?: string;
  /** The secondary line wraps instead of being cut: a description of the option (spec 052). */
  wrapSecondary?: boolean;
  badges?: string[];
  /** Group of the option in the select variant (skills by category, weapon skills by melee or ranged). */
  group?: string;
  /** Not selectable, with this reason. */
  disabledReason?: string;
  /** Shown instead of the image. */
  icon?: ReactNode;
  /** The entity, passed back by onChange. */
  entity?: T;
}

export type EntityPickerVariant = 'auto' | 'tiles' | 'select';

/** With `variant="auto"`, up to this many options are shown as tiles (spec 046, decision 8). */
export const ENTITY_PICKER_TILES_UP_TO = 8;

type CommonProps<T> = {
  /** `undefined` while they load. */
  options: EntityOption<T>[] | undefined;
  /** Kind of entity: the fallback image of the options without one. */
  kind?: EntityKind;
  /** `auto` (default): tiles up to 8 options, a searchable select above. */
  variant?: EntityPickerVariant;
  label?: string;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  placeholder?: string;
  emptyText?: string;
  /** No avatars (lists of plain values). */
  hideImages?: boolean;
  /** CSS filter of the images (the sepia filter of the item illustrations). */
  imageFilter?: string;
};

type SingleProps<T> = CommonProps<T> & {
  mode?: 'single';
  value: string | null | undefined;
  /** `null` when "all" is chosen or the select is cleared. */
  onChange: (id: string | null, entity: T | undefined) => void;
  /** An "all" option first, which reports `null` (filters). */
  allowAll?: boolean;
  allLabel?: string;
  /** The select can be cleared; by default when it is not required. */
  clearable?: boolean;
};

type MultipleProps<T> = CommonProps<T> & {
  mode: 'multiple';
  value: string[];
  onChange: (ids: string[], entities: T[]) => void;
  /** At most this many values. */
  max?: number;
};

export type EntityPickerProps<T = unknown> = SingleProps<T> | MultipleProps<T>;

const ALL_ID = '\u0000all';

/** Options with the ones of each group together, in the order the groups first appear (Autocomplete needs it). */
const byGroup = <T,>(options: EntityOption<T>[]): EntityOption<T>[] => {
  if (!options.some((option) => option.group)) return options;
  const order: string[] = [];
  options.forEach((option) => !order.includes(option.group ?? '') && order.push(option.group ?? ''));
  return order.flatMap((group) => options.filter((option) => (option.group ?? '') === group));
};

/**
 * Chooses one or several entities with their image (spec 046, decision 8): chips with an avatar (`tiles`, a radio
 * group or a group of checkboxes) for a few options, or a searchable and groupable select with the avatar in the
 * options and in the value. The size of the controls comes from the theme density.
 */
export default function EntityPicker<T = unknown>(props: EntityPickerProps<T>) {
  const {
    options,
    kind,
    variant = 'auto',
    label,
    name,
    required = false,
    disabled = false,
    error,
    helperText,
    placeholder,
    emptyText,
    hideImages = false,
    imageFilter,
  } = props;
  const { t } = useTranslation();
  const labelId = useId();
  const tilesRef = useRef<HTMLDivElement>(null);
  const multiple = props.mode === 'multiple';
  const allowAll = !multiple && !!(props as SingleProps<T>).allowAll;
  const list = options ?? [];
  const tiles = variant === 'tiles' || (variant === 'auto' && !!options && list.length <= ENTITY_PICKER_TILES_UP_TO);
  const selectedIds = multiple ? props.value : props.value ? [props.value] : [];
  const missing = required && selectedIds.length === 0;
  const max = multiple ? props.max : undefined;
  const allOption: EntityOption<T> = {
    id: ALL_ID,
    label: (props as SingleProps<T>).allLabel ?? t('all'),
  };
  const entitiesOf = (ids: string[]) =>
    ids.map((id) => list.find((option) => option.id === id)?.entity).filter((entity): entity is T => !!entity);

  const choose = (id: string) => {
    if (props.mode === 'multiple') {
      const next = props.value.includes(id) ? props.value.filter((each) => each !== id) : [...props.value, id];
      props.onChange(next, entitiesOf(next));
    } else {
      const next = id === ALL_ID ? null : id;
      props.onChange(next, next ? list.find((option) => option.id === next)?.entity : undefined);
    }
  };

  const avatar = (option: EntityOption<T>, size: number) =>
    hideImages && !option.icon ? undefined : (
      <EntityAvatar
        name={option.label}
        imageUrl={option.imageUrl}
        kind={option.id === ALL_ID ? undefined : kind}
        icon={option.icon}
        size={size}
        faded={!!option.disabledReason}
        imageFilter={imageFilter}
      />
    );

  if (tiles) {
    const shown = allowAll ? [allOption, ...list] : list;
    const isChecked = (option: EntityOption<T>) =>
      option.id === ALL_ID ? selectedIds.length === 0 : selectedIds.includes(option.id);
    const isDisabled = (option: EntityOption<T>) =>
      disabled ||
      !!option.disabledReason ||
      (max !== undefined && selectedIds.length >= max && !selectedIds.includes(option.id));
    const enabled = shown.filter((option) => !isDisabled(option));
    // Roving focus of a radio group: only the checked radio (or the first) is in the tab order.
    const focusId = (enabled.find(isChecked) ?? enabled[0])?.id;
    const onKeyDown = (event: KeyboardEvent, option: EntityOption<T>) => {
      if (multiple) return;
      const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
      if (!step) return;
      event.preventDefault();
      const index = enabled.findIndex((each) => each.id === option.id);
      const next = enabled[(index + step + enabled.length) % enabled.length];
      if (!next) return;
      choose(next.id);
      [...(tilesRef.current?.querySelectorAll<HTMLElement>('[data-option]') ?? [])]
        .find((element) => element.dataset.option === next.id)
        ?.focus();
    };
    return (
      <Stack spacing={0.5}>
        {label && (
          <Typography id={labelId} variant="caption" color={error || missing ? 'error' : 'text.secondary'}>
            {required ? `${label} *` : label}
          </Typography>
        )}
        <Box
          ref={tilesRef}
          role={multiple ? 'group' : 'radiogroup'}
          aria-labelledby={label ? labelId : undefined}
          aria-required={!multiple && required ? true : undefined}
          sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}
        >
          {!options && <Typography variant="body2">{t('loading')}</Typography>}
          {options && shown.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              {emptyText ?? t('no-options')}
            </Typography>
          )}
          {shown.map((option) => {
            const checked = isChecked(option);
            const chip = (
              <Chip
                key={option.id}
                data-option={option.id}
                role={multiple ? 'checkbox' : 'radio'}
                aria-checked={checked}
                aria-label={option.label}
                aria-disabled={isDisabled(option) || undefined}
                tabIndex={isDisabled(option) ? -1 : multiple || option.id === focusId ? 0 : -1}
                label={option.label}
                avatar={avatar(option, avatarSize.tile)}
                color={checked ? 'primary' : 'default'}
                variant={checked ? 'filled' : 'outlined'}
                disabled={isDisabled(option)}
                onClick={() => choose(option.id)}
                onKeyDown={(event) => onKeyDown(event, option)}
                sx={{ minHeight: 40 }}
              />
            );
            const hint = option.disabledReason ?? option.secondary;
            return hint ? (
              <Tooltip key={option.id} title={hint}>
                <span>{chip}</span>
              </Tooltip>
            ) : (
              chip
            );
          })}
        </Box>
        {helperText && <FormHelperText error={error}>{helperText}</FormHelperText>}
        {name && <input type="hidden" name={name} value={selectedIds.join(',')} />}
      </Stack>
    );
  }

  const optionContent = (option: EntityOption<T>) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
      {avatar(option, avatarSize.option)}
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" noWrap>
          {option.label}
        </Typography>
        {(option.disabledReason || option.secondary) && (
          <Typography
            variant="caption"
            component="div"
            color={option.disabledReason ? 'error.main' : 'text.secondary'}
            noWrap={!option.wrapSecondary}
            sx={option.wrapSecondary ? { whiteSpace: 'normal', maxWidth: 420 } : undefined}
          >
            {option.disabledReason ?? option.secondary}
          </Typography>
        )}
      </Box>
      {option.badges?.map((badge) => (
        <Chip key={badge} size="small" label={badge} />
      ))}
    </Stack>
  );
  const ordered = byGroup(list);
  const common = {
    options: allowAll ? [allOption, ...ordered] : ordered,
    disabled,
    fullWidth: true,
    loading: !options,
    loadingText: t('loading'),
    noOptionsText: emptyText ?? t('no-options'),
    getOptionLabel: (option: EntityOption<T>) => option.label,
    getOptionDisabled: (option: EntityOption<T>) =>
      !!option.disabledReason || (max !== undefined && selectedIds.length >= max && !selectedIds.includes(option.id)),
    isOptionEqualToValue: (option: EntityOption<T>, current: EntityOption<T>) => option.id === current.id,
    groupBy: list.some((option) => option.group) ? (option: EntityOption<T>) => option.group ?? '' : undefined,
    renderOption: (
      { key, ...liProps }: React.HTMLAttributes<HTMLLIElement> & { key: React.Key },
      option: EntityOption<T>
    ) => (
      <li key={key} {...liProps}>
        {optionContent(option)}
      </li>
    ),
  };
  const input = (params: React.ComponentProps<typeof TextField>, adornment?: ReactNode) => (
    <TextField
      {...params}
      label={label}
      name={name}
      placeholder={selectedIds.length === 0 ? placeholder : undefined}
      required={required}
      error={error ?? missing}
      helperText={helperText}
      slotProps={
        adornment
          ? {
              ...params.slotProps,
              input: {
                ...(params.slotProps?.input as object),
                startAdornment: <InputAdornment position="start">{adornment}</InputAdornment>,
              },
            }
          : params.slotProps
      }
    />
  );

  if (props.mode === 'multiple') {
    const value = props.value
      .map((id) => list.find((option) => option.id === id))
      .filter((option): option is EntityOption<T> => !!option);
    return (
      <Autocomplete
        {...common}
        multiple
        disableCloseOnSelect
        value={value}
        onChange={(_, next) => {
          const ids = next.map((option) => option.id);
          props.onChange(ids, entitiesOf(ids));
        }}
        renderValue={(selected, getItemProps) =>
          selected.map((option, index) => {
            const { key, ...itemProps } = getItemProps({ index });
            return <Chip key={key} {...itemProps} label={option.label} avatar={avatar(option, avatarSize.chip)} />;
          })
        }
        renderInput={(params) => input(params)}
      />
    );
  }

  const single = props as SingleProps<T>;
  const selected =
    list.find((option) => option.id === single.value) ?? (allowAll && !single.value ? allOption : undefined);
  const clearable = single.clearable ?? (!required && !allowAll);
  return (
    <Autocomplete
      {...common}
      disableClearable={!clearable}
      value={selected ?? (null as unknown as EntityOption<T>)}
      onChange={(_, option) => choose(option?.id ?? ALL_ID)}
      renderInput={(params) =>
        input(params, selected && selected.id !== ALL_ID ? avatar(selected, avatarSize.input) : undefined)
      }
    />
  );
}
