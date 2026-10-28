import React, { FC, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import {
  Alert,
  Box,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { fetchItems } from '../../api/item.api';
import { Item } from '../../api/item.dto';
import { Realm } from '../../api/realm.dto';
import { ListFilters } from '../../data/useListFilters';
import { useLocalPagedQuery } from '../../data/useLocalPagedQuery';
import { PagedQuery } from '../../data/usePagedQuery';
import RmuPagination from '../../display/RmuPagination';
import ClearableTextField from '../../inputs/ClearableTextField';
import EntityPicker from '../../selectors/EntityPicker';
import { EnumPicker, ItemCategoryPicker, RarityPicker, RealmPicker } from '../../selectors/pickers';
import CardGrid from '../../templates/CardGrid';
import { CollectionMode } from '../../templates/CollectionView';
import FilterBar from '../../templates/FilterBar';
import { FilterPanel, FilterSection } from '../../templates/FilterPanel';
import { FilterPanelToggle, ListResultsBar, useFilterPanelOpen } from '../../templates/ListPage';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/states/EmptyState';
import ErrorState from '../../ui/states/ErrorState';
import LoadingState from '../../ui/states/LoadingState';
import ItemCard, { itemCatalogColumns } from './ItemCard';
import {
  ARMOR_CLASSES,
  ARMOR_SLOT_FILTERS,
  ARMOR_TYPES,
  ITEM_FEATURE_FILTERS,
  ITEM_PAGE_SIZES,
  ITEM_SORTS,
  sortItems,
  WEAPON_ATTACKS,
  WEAPON_HANDS,
  WEAPON_SKILLS,
  weaponSkillImage,
  weaponSkillLabel,
} from './item-catalog';

type GridSize = Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', number>>;

/** Largest page of rmu-api-items (`CatalogPagedQueryDto`): the catalog is loaded whole (decision 12). */
export const ITEM_CATALOG_MAX = 1000;

/** Grid of item cards: two per row on phones. */
export const gridSizeItemCard: GridSize = { xs: 6, sm: 4, md: 3, xl: 2 };

/**
 * The item catalog loaded whole once (decision 4); `truncated` when it reached the API limit. `exclude` leaves out
 * some ids (the gold coin of the market). Requires an auth provider.
 */
export function useItemCatalog({ exclude = [] }: { exclude?: string[] } = {}) {
  const auth = useAuth();
  const [items, setItems] = useState<Item[]>();
  const [error, setError] = useState<unknown>();
  const [truncated, setTruncated] = useState(false);
  const [reloads, setReloads] = useState(0);
  const excluded = exclude.join(',');
  useEffect(() => {
    let cancelled = false;
    fetchItems('', 0, ITEM_CATALOG_MAX, auth)
      .then((page) => {
        if (cancelled) return;
        const skip = excluded.split(',');
        setItems(page.content.filter((item) => !skip.includes(item.id)));
        setTruncated(page.pagination.totalElements > page.content.length);
        setError(undefined);
      })
      .catch((err) => !cancelled && setError(err));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [excluded, reloads]);
  const refresh = useCallback(() => setReloads((count) => count + 1), []);
  return { items, error, truncated, refresh };
}

/**
 * The catalog filtered with `filters.match`, sorted by its `sort` and `dir` and split in pages on the client
 * (decision 12), as a PagedQuery for ListPage or ItemCatalogBrowser. Changing a filter goes back to the first page.
 */
export function useItemCatalogQuery(
  items: Item[] | undefined,
  filters: ListFilters<Item>,
  { pageSize = ITEM_PAGE_SIZES[0], error, refresh }: { pageSize?: number; error?: unknown; refresh?: () => void } = {}
): PagedQuery<Item> {
  const { t } = useTranslation();
  const sort = filters.get('sort');
  const dir = filters.get('dir');
  const filtered = useMemo(
    () => items && sortItems(items.filter(filters.match), sort, dir, t),
    [items, filters.match, sort, dir, t]
  );
  return useLocalPagedQuery(filtered, { pageSize, resetKey: filters.key, error, refresh });
}

/** Sort of the catalog: by name, cost, weight or AT, and its direction. */
export const ItemSortControl: FC<{ filters: ListFilters<Item> }> = ({ filters }) => {
  const { t } = useTranslation();
  const labels: Record<string, string> = { name: t('name'), cost: t('cost'), weight: t('weight'), at: t('at-short') };
  const desc = filters.get('dir') === 'desc';
  return (
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 180 }}>
        <EntityPicker
          variant="select"
          hideImages
          required
          label={t('sort-order')}
          options={ITEM_SORTS.map((sort) => ({ id: sort, label: labels[sort] }))}
          value={filters.get('sort') || 'name'}
          onChange={(id) => filters.set('sort', id)}
        />
      </Box>
      <Tooltip title={desc ? t('sort-descending') : t('sort-ascending')}>
        <IconButton
          aria-label={desc ? t('sort-descending') : t('sort-ascending')}
          onClick={() => filters.set('dir', desc ? 'asc' : 'desc')}
        >
          {desc ? <ArrowDownwardIcon /> : <ArrowUpwardIcon />}
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

const slotImages: Record<string, string> = {
  head: 'images/items/category-head.png',
  body: 'images/items/category-body.png',
  arms: 'images/items/category-arms.png',
  legs: 'images/items/category-legs.png',
  full: 'images/items/category-armor.png',
};

/**
 * The filter sections of the item catalog (decision 11), for the side panel of a ListPage (`filters` with
 * `filtersLayout="side"`) or of ItemCatalogBrowser. The armor and weapon sections show only with their category.
 */
export const ItemCatalogFilterSections: FC<{ filters: ListFilters<Item>; realms?: Realm[] }> = ({
  filters,
  realms,
}) => {
  const { t } = useTranslation();
  const single = (key: string) => ({
    value: filters.get(key) || null,
    onChange: (id: string | null) => filters.set(key, id),
    allowAll: true,
  });
  const multiple = (key: string) => ({
    mode: 'multiple' as const,
    value: filters.getAll(key),
    onChange: (ids: string[]) => filters.set(key, ids),
  });
  // Built outside the JSX: the i18n lint reads string arguments there as visible text.
  const bind = {
    category: single('category'),
    slot: single('slot'),
    armorClass: single('class'),
    hands: single('hands'),
    attack: single('attack'),
    realm: single('realm'),
    at: multiple('at'),
    skill: multiple('skill'),
    rarity: multiple('rarity'),
    feature: multiple('feature'),
  };
  const armor = filters.isActive('at');
  const weapon = filters.isActive('skill');
  const mine = filters.isActive('mine');
  const mineChecked = filters.get('mine') === 'true';
  const setMine = (checked: boolean) => filters.set('mine', checked ? 'true' : null);
  return (
    <>
      <FilterSection title={t('search')} collapsible={false}>
        <ClearableTextField
          label={t('search-items')}
          name="q"
          value={filters.get('q')}
          onChange={(value) => filters.set('q', value ?? '')}
        />
        <ItemCategoryPicker {...bind.category} />
      </FilterSection>
      <FilterSection title={t('item-category-armor')} hidden={!armor}>
        <EnumPicker {...bind.at} variant="tiles" label={t('at-short')} values={ARMOR_TYPES} />
        <EnumPicker {...bind.slot} variant="tiles" label={t('slot')} values={ARMOR_SLOT_FILTERS} images={slotImages} />
        <EnumPicker
          {...bind.armorClass}
          variant="tiles"
          label={t('armor-class')}
          values={ARMOR_CLASSES}
          labelPrefix="item-armor-class-"
        />
      </FilterSection>
      <FilterSection title={t('item-category-weapon')} hidden={!weapon}>
        <EntityPicker
          {...bind.skill}
          label={t('skill')}
          kind="item"
          options={WEAPON_SKILLS.map((skill) => ({
            id: skill.id,
            label: weaponSkillLabel(skill.id, t),
            group: t(skill.group),
            imageUrl: weaponSkillImage(skill.id),
          }))}
        />
        <EnumPicker {...bind.hands} variant="tiles" label={t('hands')} values={WEAPON_HANDS} />
        <EnumPicker {...bind.attack} variant="tiles" label={t('attack-type')} values={WEAPON_ATTACKS} />
      </FilterSection>
      <FilterSection title={t('rarity')}>
        <RarityPicker {...bind.rarity} label={t('rarity')} />
      </FilterSection>
      <FilterSection title={t('features')} defaultOpen={bind.feature.value.length > 0}>
        <EnumPicker
          {...bind.feature}
          variant="tiles"
          label={t('features')}
          values={ITEM_FEATURE_FILTERS}
          labelPrefix="item-filter-feature-"
        />
      </FilterSection>
      {(realms || mine) && (
        <FilterSection title={t('realm')}>
          {realms && <RealmPicker {...bind.realm} realms={realms} />}
          {mine && (
            <FormControlLabel
              control={<Switch checked={mineChecked} onChange={(event) => setMine(event.target.checked)} />}
              label={t('item-filter-mine')}
            />
          )}
        </FilterSection>
      )}
    </>
  );
};

export interface ItemCatalogBrowserProps {
  /** The catalog (useItemCatalog); undefined while it loads. */
  items: Item[] | undefined;
  /** useListFilters(itemCatalogFilters(t, …)). */
  filters: ListFilters<Item>;
  realms?: Realm[];
  /** `side` (default): a side panel from `lg` and a drawer below; `drawer`: always the drawer (narrow places). */
  layout?: 'side' | 'drawer';
  /** `cards` (default) or `table`. */
  mode?: Extract<CollectionMode, 'cards' | 'table'>;
  /** Click on a card or a row: open the item, or choose it. */
  onSelect?: (item: Item) => void;
  /** Highlighted card. */
  selectedId?: string;
  /** Buttons of each card (buy, craft). */
  actions?: (item: Item) => ReactNode;
  /** Shown instead of the average cost of each card (the price for the buyer, the materials of a craft). */
  price?: (item: Item) => ReactNode;
  /** Replaces ItemCard. */
  renderItem?: (item: Item) => ReactNode;
  cardSize?: GridSize;
  /** The catalog reached the API limit: a warning says some items may be missing. */
  truncated?: boolean;
  error?: unknown;
  refresh?: () => void;
  /** Key under which the visibility of the side panel is remembered. */
  storageKey?: string;
}

/**
 * The item catalog with its filters (spec 046, decisions 4 and 11-13): filtered by translated name, category, type
 * data, rarity, realm and owner, sorted and paged on the client, as cards (ItemCard) or a table. Shared by the items
 * list and the market and workshop of strategic, which add their own actions to the cards.
 */
const ItemCatalogBrowser: FC<ItemCatalogBrowserProps> = ({
  items,
  filters,
  realms,
  layout = 'side',
  mode = 'cards',
  onSelect,
  selectedId,
  actions,
  price,
  renderItem,
  cardSize = gridSizeItemCard,
  truncated = false,
  error,
  refresh,
  storageKey = 'items.catalog',
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('lg'));
  const [panelOpen, setPanelOpen] = useFilterPanelOpen(storageKey);
  const query = useItemCatalogQuery(items, filters, { error, refresh });
  const side = layout === 'side' && isWide;
  const sections = <ItemCatalogFilterSections filters={filters} realms={realms} />;

  let content: ReactNode;
  if (error && !query.items) content = <ErrorState error={error} onRetry={refresh} />;
  else if (!query.items) content = <LoadingState variant="showcase" imageRatio="square" cardSize={cardSize} />;
  else if (query.items.length === 0) content = <EmptyState title={t('catalog-empty')} />;
  else if (mode === 'table')
    content = (
      <DataTable columns={itemCatalogColumns(t)} rows={query.items} getKey={(item) => item.id} onRowClick={onSelect} />
    );
  else
    content = (
      <CardGrid
        items={query.items}
        getKey={(item) => item.id}
        size={cardSize}
        renderItem={(item) =>
          renderItem?.(item) ?? (
            <ItemCard
              item={item}
              selected={item.id === selectedId}
              onClick={onSelect ? () => onSelect(item) : undefined}
              actions={actions?.(item)}
              price={price?.(item)}
            />
          )
        }
      />
    );

  const results = (
    <Box sx={{ minWidth: 0 }}>
      {truncated && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {t('item-catalog-limit', { max: ITEM_CATALOG_MAX })}
        </Alert>
      )}
      <ListResultsBar
        count={query.items ? query.totalElements : undefined}
        filterState={filters}
        actions={<ItemSortControl filters={filters} />}
        panelToggle={side ? <FilterPanelToggle open={panelOpen} onChange={setPanelOpen} /> : undefined}
      />
      {content}
      {query.items && query.totalPages > 1 && (
        <RmuPagination
          page={query.page}
          pageSize={query.pageSize}
          totalPages={query.totalPages}
          sizes={ITEM_PAGE_SIZES}
          setPage={query.setPage}
          setPageSize={query.setPageSize}
        />
      )}
    </Box>
  );

  if (!side) {
    return (
      <Box>
        <FilterBar variant="drawer" activeCount={filters.activeCount}>
          <FilterPanel>{sections}</FilterPanel>
        </FilterBar>
        {results}
      </Box>
    );
  }
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: panelOpen ? '280px minmax(0, 1fr)' : 'minmax(0, 1fr)',
        gap: 2,
        alignItems: 'start',
      }}
    >
      {panelOpen && (
        <Box
          component="aside"
          aria-label={t('filters')}
          sx={{ position: 'sticky', top: 16, maxHeight: 'calc(100vh - 32px)', overflowY: 'auto', pr: 1 }}
        >
          <FilterPanel>{sections}</FilterPanel>
        </Box>
      )}
      {results}
    </Box>
  );
};

export default ItemCatalogBrowser;
