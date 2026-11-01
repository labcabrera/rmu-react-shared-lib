import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { Spell } from '../../api/spell.dto';
import KeyValuePanel from '../../display/KeyValuePanel';
import { alchemyEffectText } from './alchemy-format';

/**
 * The alchemy block of an alchemical spell (spec 064): its failure table, whether a batch casts it once per unit,
 * whether it creates or alters the base item, and what it gives the item. Nothing when the spell has no alchemy data.
 * `bare` leaves out the panel, to place the rows inside another container.
 */
const SpellAlchemyInfo: FC<{ spell: Pick<Spell, 'alchemy'>; bare?: boolean }> = ({ spell, bare = false }) => {
  const { t } = useTranslation();
  const alchemy = spell.alchemy;
  if (!alchemy) return null;
  const yesNo = (value: boolean) => t(value ? 'yes' : 'no');
  return (
    <KeyValuePanel
      title={bare ? undefined : t('spell-alchemy')}
      rows={[
        { label: t('alchemy-failure-table'), value: t(`alchemy-failure-table-${alchemy.failureTable}`) },
        { label: t('alchemy-per-item'), hint: t('alchemy-per-item-hint'), value: yesNo(alchemy.perItem) },
        { label: t('alchemy-alters'), hint: t('alchemy-alters-hint'), value: yesNo(alchemy.alters) },
        {
          label: t('alchemy-effect'),
          value: alchemy.effect ? alchemyEffectText(alchemy.effect, t) : t('alchemy-effect-none'),
        },
      ]}
    />
  );
};

export default SpellAlchemyInfo;
