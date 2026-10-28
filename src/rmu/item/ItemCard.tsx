import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import { Item } from '../../api/item.dto';
import EntityCard, { EntityMetric } from '../../cards/EntityCard';
import { resolveAssetUrl } from '../../config/asset-url';
import { defaultImages, itemCategoryImage } from '../../config/default-images';
import { DataTableColumn } from '../../ui/DataTable';
import ItemFeatureChips, { ItemFeatureTranslate } from './ItemFeatureChips';
import ItemThumb, { itemImageUrl } from './ItemThumb';
import MoneyDisplay from './MoneyDisplay';
import { weaponSkillLabel } from './item-catalog';

export const RARITY_COLORS: Record<string, 'default' | 'info' | 'secondary' | 'warning'> = {
  common: 'default',
  uncommon: 'info',
  rare: 'secondary',
  'very-rare': 'warning',
};

/** Name of an item, translated (catalog names are i18n keys; user items may not be). */
export const itemName = (item: Pick<Item, 'name'>, t: ItemFeatureTranslate): string =>
  t(item.name, { defaultValue: item.name });

/** Its category as `item-category-*`. */
export const itemCategoryLabel = (category: string, t: ItemFeatureTranslate): string =>
  t(`item-category-${category}`, { defaultValue: t(category) });

const handsOf = (item: Item): string[] => [...new Set(item.weapon?.modes.map((mode) => mode.type) ?? [])];

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

/** Game data of an item for its card (decision 13): armor AT/MP/ENC, shield DB/blocks, weapon skill/fumble/hands. */
export const itemMetrics = (item: Item, t: ItemFeatureTranslate): EntityMetric[] => {
  const metrics: EntityMetric[] = [];
  if (item.armor) {
    metrics.push({ label: t('at-short'), value: item.armor.at });
    metrics.push({ label: t('maneuver-penalty-short'), value: signed(item.armor.maneuverPenalty) });
    metrics.push({ label: t('enc-short'), value: signed(item.armor.enc) });
  }
  if (item.shield) {
    metrics.push({ label: t('db-short'), value: signed(item.shield.db) });
    metrics.push({ label: t('block-count'), value: item.shield.blockCount });
  }
  if (item.weapon) {
    metrics.push({ label: t('skill'), value: weaponSkillLabel(item.weapon.skillId, t) });
    metrics.push({ label: t('fumble'), value: item.weapon.fumble });
    const hands = handsOf(item);
    if (hands.length > 0) metrics.push({ label: t('hands'), value: hands.map((each) => t(each)).join(' / ') });
  }
  return metrics;
};

/** Images of an item card, in order: its own (or its type's), its category's, the generic one. */
export const itemCardImages = (item: Item): [string, string[]] => [
  itemImageUrl(item),
  [resolveAssetUrl(itemCategoryImage(item.category)), resolveAssetUrl(defaultImages.item)],
];

/**
 * Card of a catalog item (spec 046, decision 13): square EntityCard with its image (without the sepia filter), its
 * translated name and category, rarity and feature chips, the metrics of its type, and its weight and cost.
 */
const ItemCard: FC<{
  item: Item;
  onClick?: () => void;
  selected?: boolean;
  /** Buttons below the card (buy, craft). */
  actions?: ReactNode;
  /** Shown instead of the average cost (the price for the buyer, the materials and hours of a craft). */
  price?: ReactNode;
}> = ({ item, onClick, selected, actions, price }) => {
  const { t } = useTranslation();
  const [image, fallbackImages] = itemCardImages(item);
  const weight = item.info.weight;
  const cost = item.info.cost?.average;
  const metrics: EntityMetric[] = [
    ...itemMetrics(item, t),
    ...(weight !== null && weight !== undefined ? [{ label: t('weight'), value: `${weight} ${t('lbs')}` }] : []),
  ];
  return (
    <EntityCard
      title={itemName(item, t)}
      subtitle={itemCategoryLabel(item.category, t)}
      image={image}
      fallbackImages={fallbackImages}
      imageRatio="square"
      selected={selected}
      onClick={onClick}
      actions={actions}
      chips={
        <>
          <Chip size="small" label={t(item.info.rarity)} color={RARITY_COLORS[item.info.rarity]} />
          <ItemFeatureChips
            item={{ features: item.features, lotSize: item.info.lotSize, armor: item.armor, weapon: item.weapon }}
          />
        </>
      }
      metrics={[
        ...metrics,
        {
          label: t('cost'),
          value:
            price ??
            (cost ? (
              <MoneyDisplay gold={cost} variant="subtitle2" />
            ) : (
              <Typography variant="subtitle2" color="text.secondary" component="span">
                {t('price-unknown')}
              </Typography>
            )),
        },
      ]}
    />
  );
};

/** Columns of the table view of the catalog (decision 13): name, category, rarity, AT/DB, weight and cost. */
export const itemCatalogColumns = (t: ItemFeatureTranslate): DataTableColumn<Item>[] => [
  {
    key: 'name',
    header: t('name'),
    render: (item) => (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <ItemThumb item={item} size={32} />
        <span>{itemName(item, t)}</span>
      </Stack>
    ),
  },
  { key: 'category', header: t('category'), render: (item) => itemCategoryLabel(item.category, t) },
  {
    key: 'rarity',
    header: t('rarity'),
    render: (item) => <Chip size="small" label={t(item.info.rarity)} color={RARITY_COLORS[item.info.rarity]} />,
  },
  {
    key: 'defense',
    header: `${t('at-short')} / ${t('db-short')}`,
    align: 'right',
    render: (item) =>
      item.armor
        ? `${t('at-short')} ${item.armor.at}`
        : item.shield
          ? `${t('db-short')} ${signed(item.shield.db)}`
          : '',
  },
  {
    key: 'weight',
    header: t('weight'),
    align: 'right',
    render: (item) =>
      item.info.weight !== null && item.info.weight !== undefined ? `${item.info.weight} ${t('lbs')}` : '',
  },
  {
    key: 'cost',
    header: t('cost'),
    align: 'right',
    render: (item) => (item.info.cost?.average ? <MoneyDisplay gold={item.info.cost.average} /> : ''),
  },
];

export default ItemCard;
