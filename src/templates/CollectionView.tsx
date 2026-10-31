import React, { ReactNode, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewAgendaIcon from '@mui/icons-material/ViewAgenda';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Box, Chip, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { enterSx } from '../motion/motion';
import DataTable, { DataTableColumn } from '../ui/DataTable';
import CardGrid from './CardGrid';

export type CollectionMode = 'cards' | 'table' | 'grouped';

/** How a list page shows its items besides the default card grid. */
export interface CollectionConfig<T> {
  /** Views the user can choose; the first one is the default. */
  modes: CollectionMode[];
  /** Key under which the user's choice is remembered (one per list, for example `core.skills`). */
  storageKey: string;
  /** Columns of the `table` and `grouped` views. */
  columns?: DataTableColumn<T>[];
  /** Group key of the `grouped` view. Groups follow the order of the items. */
  groupBy?: (item: T) => string;
  groupLabel?: (group: string) => ReactNode;
  /** Row click in the `table` and `grouped` views (cards handle their own clicks). */
  onSelect?: (item: T) => void;
}

const storageKeyOf = (key: string) => `rmu.view.${key}`;

/** The view the user chose for a list, remembered in localStorage. */
export const useCollectionMode = (storageKey: string, modes: CollectionMode[]) => {
  const [mode, setModeState] = useState<CollectionMode>(() => {
    try {
      const stored = localStorage.getItem(storageKeyOf(storageKey)) as CollectionMode | null;
      return stored && modes.includes(stored) ? stored : modes[0];
    } catch {
      return modes[0];
    }
  });
  const setMode = useCallback(
    (next: CollectionMode) => {
      setModeState(next);
      try {
        localStorage.setItem(storageKeyOf(storageKey), next);
      } catch {
        // Storage unavailable: the choice lasts until the page is left.
      }
    },
    [storageKey]
  );
  return [mode, setMode] as const;
};

const modeIcons: Record<CollectionMode, ReactNode> = {
  cards: <ViewModuleIcon fontSize="small" />,
  table: <TableRowsIcon fontSize="small" />,
  grouped: <ViewAgendaIcon fontSize="small" />,
};

/** Toggle between the views of a list. */
export const CollectionModeSwitch = ({
  modes,
  value,
  onChange,
}: {
  modes: CollectionMode[];
  value: CollectionMode;
  onChange: (mode: CollectionMode) => void;
}) => {
  const { t } = useTranslation();
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, mode: CollectionMode | null) => mode && onChange(mode)}
      aria-label={t('view-mode')}
      sx={{ mx: 1 }}
    >
      {modes.map((mode) => (
        <ToggleButton key={mode} value={mode} aria-label={t(`view-${mode}`)}>
          <Tooltip title={t(`view-${mode}`)}>
            <Box component="span" sx={{ display: 'flex' }}>
              {modeIcons[mode]}
            </Box>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};

/** Items as a card grid, a table, or a table split in groups, depending on `mode`. */
export default function CollectionView<T>({
  items,
  getKey,
  renderItem,
  mode,
  config,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  mode: CollectionMode;
  config?: CollectionConfig<T>;
}) {
  const columns = config?.columns ?? [];
  if (mode === 'table' && columns.length > 0) {
    return (
      <Box sx={enterSx()}>
        <DataTable columns={columns} rows={items} getKey={getKey} onRowClick={config?.onSelect} />
      </Box>
    );
  }
  if (mode === 'grouped' && columns.length > 0 && config?.groupBy) {
    const groups = new Map<string, T[]>();
    items.forEach((item) => {
      const group = config.groupBy!(item);
      groups.set(group, [...(groups.get(group) ?? []), item]);
    });
    return (
      <Stack spacing={2}>
        {[...groups.entries()].map(([group, rows], index) => (
          <Box key={group} sx={enterSx(index)}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
              <Typography variant="overline" color="text.secondary">
                {config.groupLabel?.(group) ?? group}
              </Typography>
              <Chip size="small" label={rows.length} />
            </Stack>
            <DataTable columns={columns} rows={rows} getKey={getKey} onRowClick={config.onSelect} />
          </Box>
        ))}
      </Stack>
    );
  }
  return <CardGrid items={items} renderItem={renderItem} getKey={getKey} />;
}
