import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import type { ItemEnchantment } from '../../api/enchantment.dto';
import type { ItemCharges, MagicItemFeature } from '../../api/magic-item.dto';
import ChipRow from '../../display/ChipRow';
import { KeyValueList, KeyValueRow } from '../../display/KeyValuePanel';
import Panel from '../../layouts/Panel';
import SectionLabel from '../../layouts/SectionLabel';
import MoneyDisplay from '../item/MoneyDisplay';
import {
  enchantmentView,
  magicBonusText,
  magicFeatureView,
  MagicItemView,
  magicSpellName,
  magicSpellUseText,
} from './magic-format';

export type MagicItemInfoProps = {
  /** The `features.magic` block of a catalog item. */
  magic?: MagicItemFeature | null;
  /** The enchantment of a strategic item, used when there is no `magic`. */
  enchantment?: ItemEnchantment | null;
  /** The charges of a strategic item. */
  charges?: ItemCharges | null;
  /** Panel title; `item-magic` by default. */
  title?: string;
  /** Without the panel, to place the content inside another container. */
  bare?: boolean;
  /** Controls on the panel title row (spend or recharge buttons). */
  extra?: ReactNode;
  dense?: boolean;
};

/**
 * A magic item (spec 067): the `features.magic` block of the catalog or the enchantment of an owned item, with its
 * level, kind, attunement, charges, bonuses and spells. Nothing when there is neither.
 */
const MagicItemInfo: FC<MagicItemInfoProps> = ({
  magic,
  enchantment,
  charges,
  title,
  bare = false,
  extra,
  dense = false,
}) => {
  const { t } = useTranslation();
  const view: MagicItemView | null = magic
    ? magicFeatureView(magic)
    : enchantment
      ? enchantmentView(enchantment, charges)
      : null;
  if (!view) return null;

  const rows: KeyValueRow[] = [
    { label: t('enchantment-item-level'), hint: t('enchantment-item-level-hint'), value: view.itemLevel },
  ];
  if (view.kind) rows.push({ label: t('magic-kind'), value: t(`magic-kind-${view.kind}`) });
  if (view.realm) rows.push({ label: t('realm'), value: t(view.realm) });
  if (view.attunement !== null) rows.push({ label: t('attunement'), value: t(view.attunement ? 'yes' : 'no') });
  if (view.charges)
    rows.push({
      label: t('magic-charges'),
      value:
        view.charges.current === null
          ? view.charges.max
          : t('magic-charges-value', { current: view.charges.current, max: view.charges.max }),
      tone: view.charges.current === 0 ? 'danger' : 'default',
    });
  if (view.days !== null) rows.push({ label: t('days'), value: view.days });
  if (view.standardPrice !== null)
    rows.push({
      label: t('magic-standard-price'),
      hint: t('magic-standard-price-hint'),
      value: <MoneyDisplay gold={view.standardPrice} />,
    });
  if (view.source) rows.push({ label: t('magic-source'), value: t(`magic-source-${view.source}`) });
  if (view.alchemistName) rows.push({ label: t('enchantment-alchemist'), value: view.alchemistName });

  const content = (
    <Stack spacing={1.5}>
      <KeyValueList rows={rows} dense={dense} />
      {view.bonuses.length > 0 && (
        <Stack spacing={0.75}>
          <SectionLabel>{t('magic-bonuses')}</SectionLabel>
          <ChipRow>
            {view.bonuses.map((bonus, index) => (
              <Chip key={index} size="small" color="primary" variant="outlined" label={magicBonusText(bonus, t)} />
            ))}
          </ChipRow>
        </Stack>
      )}
      {view.spells.length > 0 && (
        <Stack spacing={0.75}>
          <SectionLabel>{t('enchantment-spells')}</SectionLabel>
          <Stack spacing={0.5}>
            {view.spells.map((spell, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Typography variant="body2">{magicSpellName(spell, t)}</Typography>
                {spell.use && <Chip size="small" label={magicSpellUseText(spell.use, spell.perDay, t)} />}
              </Stack>
            ))}
          </Stack>
        </Stack>
      )}
    </Stack>
  );

  if (bare) return content;
  return (
    <Panel title={title ?? t('item-magic')} extra={extra} dense={dense}>
      {content}
    </Panel>
  );
};

export default MagicItemInfo;
