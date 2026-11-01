import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import type { StrategicItem } from '../../api/strategic-item.dto';
import KeyValuePanel from '../../display/KeyValuePanel';
import { alchemyEffectText } from './alchemy-format';

const dateText = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

/**
 * The enchantment of an item (spec 064): its level (added to its breakage rolls), the alchemist, the spells embedded
 * in it and the properties that are kept as text (spell adders, power point multipliers, skill bonuses). The OB and
 * DB bonuses are modifiers of the item. Nothing when the item is not enchanted. `bare` leaves out the panel.
 */
const ItemEnchantmentInfo: FC<{ item: Pick<StrategicItem, 'enchantment'>; bare?: boolean }> = ({
  item,
  bare = false,
}) => {
  const { t } = useTranslation();
  const enchantment = item.enchantment;
  if (!enchantment) return null;
  const properties = enchantment.properties ?? [];
  return (
    <KeyValuePanel
      title={bare ? undefined : t('item-enchantment')}
      rows={[
        { label: t('enchantment-item-level'), hint: t('enchantment-item-level-hint'), value: enchantment.itemLevel },
        { label: t('enchantment-alchemist'), value: enchantment.alchemistName },
        {
          label: t('enchantment-spells'),
          value: (
            <Stack component="span" sx={{ alignItems: 'flex-end' }}>
              {enchantment.spells.map((spell) => (
                <Typography key={spell.spellId} variant="body2" component="span" sx={{ fontWeight: 'inherit' }}>
                  {t('enchantment-spell-line', { name: spell.name, level: spell.level, list: spell.listCode })}
                </Typography>
              ))}
            </Stack>
          ),
        },
        ...(properties.length > 0
          ? [
              {
                label: t('enchantment-properties'),
                value: (
                  <Stack component="span" sx={{ alignItems: 'flex-end' }}>
                    {properties.map((property, index) => (
                      <Typography key={index} variant="body2" component="span" sx={{ fontWeight: 'inherit' }}>
                        {property.target
                          ? `${alchemyEffectText(property, t)} · ${t(property.target, property.target)}`
                          : alchemyEffectText(property, t)}
                      </Typography>
                    ))}
                  </Stack>
                ),
              },
            ]
          : []),
        { label: t('enchantment-completed-at'), value: dateText(enchantment.completedAt) },
      ]}
    />
  );
};

export default ItemEnchantmentInfo;
