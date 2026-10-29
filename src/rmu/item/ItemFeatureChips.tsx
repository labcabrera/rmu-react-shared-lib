import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import { ItemArmor, ItemFeatures, WeaponMode } from '../../api/item.dto';

/** What ItemFeatureChips reads: a catalog item or the catalog copy of a strategic item. */
export type ItemFeatureSource = {
  features?: ItemFeatures | null;
  lotSize?: number | null;
  armor?: Pick<ItemArmor, 'coverage' | 'class'> | null;
  weapon?: { modes: Pick<WeaponMode, 'obModifier'>[] } | null;
};

export type ItemFeatureLine = { key: string; label: string };

/**
 * The `t` of react-i18next. Loose on purpose: each MFE has its own copy of i18next, and their TFunction types do not
 * match the one of the lib.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ItemFeatureTranslate = (key: string, options?: any) => string;

const signed = (value: number): string => (value > 0 ? `+${value}` : `${value}`);

/**
 * The lines of the general equipment data of an item (spec 041): lot, container capacity, light, transport,
 * ammunition, poison and antidote (spec 042), the coverage of a full suit, the class of a piece and the OB modifier of an improvised weapon.
 */
export const itemFeatureLines = (item: ItemFeatureSource, t: ItemFeatureTranslate): ItemFeatureLine[] => {
  const lines: ItemFeatureLine[] = [];
  const { container, light, transport, ammunition, poison, antidote } = item.features ?? {};
  if (item.lotSize && item.lotSize > 1)
    lines.push({ key: 'lot', label: t('item-feature-lot', { size: item.lotSize }) });
  if (container) {
    if (container.weight)
      lines.push({ key: 'weight', label: t('item-feature-container-weight', { value: container.weight }) });
    if (container.volume)
      lines.push({ key: 'volume', label: t('item-feature-container-volume', { value: container.volume }) });
    if (container.liquid)
      lines.push({ key: 'liquid', label: t('item-feature-container-liquid', { value: container.liquid }) });
    if (container.units)
      lines.push({ key: 'units', label: t('item-feature-container-units', { value: container.units }) });
  }
  if (light?.radius) lines.push({ key: 'radius', label: t('item-feature-light-radius', { value: light.radius }) });
  if (light?.durationHours)
    lines.push({ key: 'duration', label: t('item-feature-light-duration', { value: light.durationHours }) });
  if (transport?.capacity)
    lines.push({ key: 'capacity', label: t('item-feature-transport-capacity', { value: transport.capacity }) });
  if (transport?.speed)
    lines.push({ key: 'speed', label: t('item-feature-transport-speed', { value: transport.speed }) });
  if (ammunition?.launchers.length) {
    const launchers = ammunition.launchers.map((id) => t(id)).join(', ');
    lines.push({ key: 'launchers', label: t('item-feature-ammunition', { launchers }) });
  }
  if (ammunition?.sizeAdjustment) {
    lines.push({ key: 'size', label: t('item-feature-ammunition-size', { value: signed(ammunition.sizeAdjustment) }) });
  }
  // Poison and antidote data go in short chips (category, level, form...): a single sentence did not fit in a card
  if (poison) {
    lines.push({
      key: 'poison',
      label: t('item-feature-poison-category', { category: t(`poison-category-${poison.category}`) }),
    });
    lines.push({ key: 'poison-level', label: t('item-feature-poison-level', { level: poison.level }) });
    if (poison.form) lines.push({ key: 'poison-form', label: t(`poison-form-${poison.form}`) });
    if (poison.maxSeverity)
      lines.push({
        key: 'max-severity',
        label: t('item-feature-poison-max', { severity: t(`poison-severity-${poison.maxSeverity}`) }),
      });
  }
  if (antidote) {
    const categories = antidote.categories.map((category) => t(`poison-category-${category}`)).join(', ');
    lines.push({ key: 'antidote', label: t('item-feature-antidote-categories', { categories }) });
    lines.push({ key: 'antidote-level', label: t('item-feature-antidote-level', { level: antidote.level }) });
    if (antidote.withinHours)
      lines.push({ key: 'within', label: t('item-feature-antidote-within', { count: antidote.withinHours }) });
  }
  if (item.armor?.coverage && item.armor.coverage.length > 1)
    lines.push({ key: 'coverage', label: t('item-feature-full-suit') });
  if (item.armor?.class) lines.push({ key: 'class', label: t(`item-armor-class-${item.armor.class}`) });
  const improvised = item.weapon?.modes.find((mode) => mode.obModifier)?.obModifier;
  if (improvised) lines.push({ key: 'improvised', label: t('item-feature-improvised', { value: signed(improvised) }) });
  return lines;
};

/** Badges with the general equipment data of an item (spec 041); nothing when it has none. */
const ItemFeatureChips: FC<{ item: ItemFeatureSource; variant?: 'badges' | 'text' }> = ({
  item,
  variant = 'badges',
}) => {
  const { t } = useTranslation();
  const lines = itemFeatureLines(item, t);
  if (lines.length === 0) return null;
  if (variant === 'text') {
    return (
      <Typography variant="caption" color="text.secondary">
        {lines.map((line) => line.label).join(' · ')}
      </Typography>
    );
  }
  return (
    <Stack direction="row" spacing={0.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
      {lines.map((line) => (
        <Chip key={line.key} label={line.label} size="small" variant="outlined" />
      ))}
    </Stack>
  );
};

export default ItemFeatureChips;
