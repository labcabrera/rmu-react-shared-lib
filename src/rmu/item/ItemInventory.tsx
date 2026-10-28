import React, { FC, ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DiamondIcon from '@mui/icons-material/Diamond';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import {
  Box,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { StrategicItem, itemUnits } from '../../api/strategic-item.dto';
import SearchField from '../../templates/SearchField';
import EmptyState from '../../ui/states/EmptyState';
import ItemConditionChip from './ItemConditionChip';
import ItemModifierChips from './ItemModifierChips';
import ItemThumb from './ItemThumb';
import MoneyDisplay from './MoneyDisplay';
import { roundGold } from './money';

/** An action of the menu of an item: equip, sell, give, repair... */
export type ItemAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  onClick: (item: StrategicItem) => void;
  disabled?: boolean;
  danger?: boolean;
};

type Grouping = 'category' | 'carried';

/** Reference gold of all the units of an item: its value, or the average cost of its type. */
export const itemTotalValue = (item: StrategicItem): number =>
  roundGold((item.value ?? item.catalog?.cost?.average ?? item.info?.cost?.average ?? 0) * itemUnits(item));

/** Weight of all the units of an item. */
export const itemTotalWeight = (item: StrategicItem): number =>
  Math.round((item.info?.weight ?? 0) * itemUnits(item) * 100) / 100;

const ItemRow: FC<{
  item: StrategicItem;
  equipped: boolean;
  actions: ItemAction[];
  onSelect?: (item: StrategicItem) => void;
}> = ({ item, equipped, actions, onSelect }) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const modifiers = (item.modifiers ?? []).filter((modifier) => modifier.type !== 'breakage');
  const name = t(item.name, { defaultValue: item.name });
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        alignItems: 'center',
        px: 1,
        py: 0.75,
        borderRadius: 1,
        cursor: onSelect ? 'pointer' : 'default',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={() => onSelect?.(item)}
      aria-label={name}
    >
      <ItemThumb item={item} size={44} disabled={!!item.condition?.broken} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexWrap: 'wrap' }} useFlexGap>
          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
            {name}
          </Typography>
          {item.info?.stackable && <Chip size="small" label={`× ${itemUnits(item)}`} />}
          {equipped && <Chip size="small" color="primary" label={t('equipped')} />}
          <ItemConditionChip condition={item.condition} />
          {item.material && (
            <Chip
              size="small"
              variant="outlined"
              color={item.material.magical ? 'secondary' : 'default'}
              icon={<DiamondIcon />}
              data-testid="item-material"
              label={t(`material-${item.material.id}`, item.material.id)}
            />
          )}
          {item.coating && (
            <Chip
              size="small"
              color="secondary"
              variant="outlined"
              icon={<ScienceIcon />}
              label={t('item-coated', { name: t(item.coating.name, item.coating.name) })}
            />
          )}
        </Stack>
        {modifiers.length > 0 && (
          <Box sx={{ mt: 0.25 }}>
            <ItemModifierChips modifiers={modifiers} max={2} />
          </Box>
        )}
      </Box>
      <Stack sx={{ alignItems: 'flex-end', display: { xs: 'none', sm: 'flex' }, minWidth: 96 }}>
        <MoneyDisplay gold={itemTotalValue(item)} />
        <Typography variant="caption" color="text.secondary">{`${itemTotalWeight(item)} ${t('lbs')}`}</Typography>
      </Stack>
      {actions.length > 0 && (
        <>
          <IconButton
            size="small"
            aria-label={t('actions')}
            onClick={(event) => {
              event.stopPropagation();
              setAnchor(event.currentTarget);
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchor}
            open={!!anchor}
            onClose={() => setAnchor(null)}
            onClick={(event) => event.stopPropagation()}
          >
            {actions.map((action) => (
              <MenuItem
                key={action.key}
                disabled={action.disabled}
                onClick={() => {
                  setAnchor(null);
                  action.onClick(item);
                }}
                sx={action.danger ? { color: 'error.main' } : undefined}
              >
                {action.icon && (
                  <ListItemIcon sx={action.danger ? { color: 'error.main' } : undefined}>{action.icon}</ListItemIcon>
                )}
                <ListItemText>{action.label}</ListItemText>
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
};

/**
 * The items of a character or a faction (spec 023, decision 13): search by name, grouped by category or by carried
 * and stored, with the value and weight of each stack and the totals. The same component serves the equipment of a
 * character and the armory of a faction; `actions` gives the menu of each item.
 */
const ItemInventory: FC<{
  items: StrategicItem[];
  actions?: (item: StrategicItem) => ItemAction[];
  equippedIds?: string[];
  onSelect?: (item: StrategicItem) => void;
  /** Group by carried and stored (a character) instead of by category. */
  groupings?: Grouping[];
  emptyTitle?: string;
  emptyAction?: ReactNode;
  hideItemTypeIds?: string[];
}> = ({
  items,
  actions,
  equippedIds = [],
  onSelect,
  groupings = ['category'],
  emptyTitle,
  emptyAction,
  hideItemTypeIds = [],
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [grouping, setGrouping] = useState<Grouping>(groupings[0]);

  const visible = useMemo(() => {
    const text = search.trim().toLowerCase();
    const name = (item: StrategicItem) => t(item.name, { defaultValue: item.name });
    return items
      .filter((item) => !hideItemTypeIds.includes(item.itemTypeId))
      .filter((item) => !text || name(item).toLowerCase().includes(text) || item.itemTypeId.includes(text))
      .sort((a, b) => name(a).localeCompare(name(b)));
  }, [items, search, hideItemTypeIds, t]);

  const groups = useMemo(() => {
    const keyOf = (item: StrategicItem) =>
      grouping === 'carried' ? (item.carried ? 'carried-items' : 'stored-items') : item.category;
    const map = new Map<string, StrategicItem[]>();
    visible.forEach((item) => map.set(keyOf(item), [...(map.get(keyOf(item)) ?? []), item]));
    const order = grouping === 'carried' ? ['carried-items', 'stored-items'] : [...map.keys()].sort();
    return order.filter((key) => map.has(key)).map((key) => ({ key, items: map.get(key)! }));
  }, [visible, grouping]);

  const totalValue = roundGold(visible.reduce((sum, item) => sum + itemTotalValue(item), 0));
  const totalWeight = Math.round(visible.reduce((sum, item) => sum + itemTotalWeight(item), 0) * 100) / 100;
  const shown = items.filter((item) => !hideItemTypeIds.includes(item.itemTypeId));

  if (shown.length === 0) {
    return <EmptyState title={emptyTitle ?? t('inventory-empty')} action={emptyAction} />;
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
        <Box sx={{ flex: 1 }}>
          <SearchField value={search} onChange={setSearch} label={t('search-items')} />
        </Box>
        {groupings.length > 1 && (
          <ToggleButtonGroup
            size="small"
            exclusive
            value={grouping}
            onChange={(_, value: Grouping | null) => value && setGrouping(value)}
            aria-label={t('group-by')}
          >
            {groupings.map((option) => (
              <ToggleButton key={option} value={option}>
                {t(`group-by-${option}`)}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        )}
      </Stack>
      {groups.length === 0 && <EmptyState />}
      {groups.map((group) => (
        <Paper key={group.key} variant="outlined" sx={{ p: 1 }}>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', px: 1, pb: 0.5 }}>
            <Typography variant="overline" color="text.secondary">
              {t(group.key)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {group.items.length}
            </Typography>
          </Stack>
          {group.items.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              equipped={equippedIds.includes(item.id)}
              actions={actions ? actions(item) : []}
              onSelect={onSelect}
            />
          ))}
        </Paper>
      ))}
      <Stack direction="row" spacing={3} sx={{ justifyContent: 'flex-end', px: 1 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('inventory-total-value')}
          </Typography>
          <MoneyDisplay gold={totalValue} />
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {t('inventory-total-weight')}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{`${totalWeight} ${t('lbs')}`}</Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default ItemInventory;
