import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useSpellName } from '../../i18n/spell-text';
import { Stack, Typography } from '@mui/material';
import type { StrategicItem } from '../../api/strategic-item.dto';
import KeyValuePanel from '../../display/KeyValuePanel';
import MagicItemInfo from '../magic/MagicItemInfo';
import { magicBonusText } from '../magic/magic-format';
import { alchemyEffectText } from './alchemy-format';

const ALCHEMY_PROPERTY_KINDS: readonly string[] = ['spell-adder', 'pp-multiplier', 'skill'];

const dateText = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

/**
 * The enchantment of an item (spec 064): its level (added to its breakage rolls), the alchemist, the spells embedded
 * in it and the properties that are kept as text (spell adders, power point multipliers, skill bonuses). The OB and
 * DB bonuses are modifiers of the item. Nothing when the item is not enchanted. `bare` leaves out the panel.
 * An enchantment that does not come from an alchemy project (spec 067: catalog, treasure, manual) is shown by
 * MagicItemInfo, with the charges of the item.
 */
const ItemEnchantmentInfo: FC<{ item: Pick<StrategicItem, 'enchantment' | 'charges'>; bare?: boolean }> = ({
  item,
  bare = false,
}) => {
  const { t } = useTranslation();
  const spellName = useSpellName();
  const enchantment = item.enchantment;
  if (!enchantment) return null;
  if (enchantment.source && enchantment.source !== 'alchemy')
    return <MagicItemInfo enchantment={enchantment} charges={item.charges} bare={bare} title={t('item-enchantment')} />;
  const properties = enchantment.properties ?? [];
  return (
    <KeyValuePanel
      title={bare ? undefined : t('item-enchantment')}
      rows={[
        { label: t('enchantment-item-level'), hint: t('enchantment-item-level-hint'), value: enchantment.itemLevel },
        ...(enchantment.alchemistName ? [{ label: t('enchantment-alchemist'), value: enchantment.alchemistName }] : []),
        {
          label: t('enchantment-spells'),
          value: (
            <Stack component="span" sx={{ alignItems: 'flex-end' }}>
              {enchantment.spells.map((spell) => (
                <Typography
                  key={spell.spellId ?? spell.name}
                  variant="body2"
                  component="span"
                  sx={{ fontWeight: 'inherit' }}
                >
                  {spell.listCode
                    ? t('enchantment-spell-line', { name: spellName(spell.name), level: spell.level, list: spell.listCode })
                    : t('magic-spell-line', { name: spellName(spell.name), level: spell.level })}
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
                        {!ALCHEMY_PROPERTY_KINDS.includes(property.kind)
                          ? magicBonusText(property, t)
                          : property.target
                            ? `${alchemyEffectText(property, t)} · ${t(property.target, property.target)}`
                            : alchemyEffectText(property, t)}
                      </Typography>
                    ))}
                  </Stack>
                ),
              },
            ]
          : []),
        ...(enchantment.completedAt
          ? [{ label: t('enchantment-completed-at'), value: dateText(enchantment.completedAt) }]
          : []),
      ]}
    />
  );
};

export default ItemEnchantmentInfo;
