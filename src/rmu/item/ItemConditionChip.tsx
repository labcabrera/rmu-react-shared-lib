import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ItemCondition } from '../../api/item-modifier.dto';
import StatusBadge from '../StatusBadge';

/**
 * Breakage state of an item (spec 019): damaged with its penalty, or broken. An intact item shows nothing, unless
 * `showIntact` asks for it.
 */
const ItemConditionChip: FC<{
  condition: ItemCondition | undefined;
  showIntact?: boolean;
  size?: 'small' | 'medium';
}> = ({ condition, showIntact = false, size = 'small' }) => {
  const { t } = useTranslation();
  if (condition?.unrepairable) {
    return (
      <StatusBadge
        status="item-unrepairable"
        label={t('item-condition-unrepairable')}
        detail={t('item-condition-unrepairable-detail')}
        color="error"
        size={size}
      />
    );
  }
  if (condition?.broken) {
    return (
      <StatusBadge
        status="item-broken"
        label={t('item-condition-broken')}
        detail={t('item-condition-broken-detail')}
        color="error"
        size={size}
      />
    );
  }
  if (condition && condition.breakagePenalty < 0) {
    return (
      <StatusBadge
        status="item-damaged"
        label={t('item-condition-damaged')}
        value={condition.breakagePenalty}
        detail={t('item-condition-damaged-detail')}
        color="warning"
        size={size}
      />
    );
  }
  if (!showIntact) {
    return null;
  }
  return <StatusBadge status="item-intact" label={t('item-condition-intact')} color="success" size={size} />;
};

export default ItemConditionChip;
