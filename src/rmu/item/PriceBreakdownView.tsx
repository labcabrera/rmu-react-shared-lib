import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Divider, Stack, Typography } from '@mui/material';
import { PriceBreakdown } from '../../api/item-operations.dto';
import MoneyDisplay from './MoneyDisplay';
import { roundGold } from './money';

const Row: FC<{ label: string; children: React.ReactNode; strong?: boolean }> = ({ label, children, strong }) => (
  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', py: 0.25, gap: 2 }}>
    <Typography
      variant="body2"
      color={strong ? 'text.primary' : 'text.secondary'}
      sx={{ fontWeight: strong ? 700 : 400 }}
    >
      {label}
    </Typography>
    {children}
  </Stack>
);

const Percent: FC<{ value: number }> = ({ value }) => (
  <Typography variant="body2" sx={{ fontWeight: 600 }}>
    {`${value}%`}
  </Typography>
);

/**
 * How a price is worked out (spec 023, decision 12): unit base, the percents of a sale and of Trading, the unit price
 * and the total. With `funds`, the gold of the payer before and after.
 */
const PriceBreakdownView: FC<{ price: PriceBreakdown; funds?: { label: string; gold: number } }> = ({
  price,
  funds,
}) => {
  const { t } = useTranslation();
  const after = funds ? roundGold(funds.gold + (price.kind === 'sale' ? price.total : -price.total)) : 0;
  return (
    <Stack aria-label={t('price-breakdown')}>
      <Row label={price.kind === 'sale' ? t('price-value') : t('price-base')}>
        <MoneyDisplay gold={price.unitBase} />
      </Row>
      {price.salePercent !== undefined && (
        <Row label={t('price-sale-percent')}>
          <Percent value={price.salePercent} />
        </Row>
      )}
      {price.conditionPercent !== undefined && (
        <Row label={t('price-condition-percent', { condition: t(`item-condition-${price.condition}`) })}>
          <Percent value={price.conditionPercent} />
        </Row>
      )}
      {price.trading && (
        <Row label={t('price-trading', { total: price.trading.total })}>
          <Percent value={price.trading.pricePercent} />
        </Row>
      )}
      <Row label={t('price-unit')}>
        <MoneyDisplay gold={price.unitPrice} />
      </Row>
      {price.amount !== 1 && (
        <Row label={t('amount')}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{`× ${price.amount}`}</Typography>
        </Row>
      )}
      <Divider sx={{ my: 0.5 }} />
      <Row label={t('price-total')} strong>
        <MoneyDisplay gold={price.total} variant="subtitle1" />
      </Row>
      {funds && (
        <>
          <Row label={funds.label}>
            <MoneyDisplay gold={funds.gold} />
          </Row>
          <Row label={t('price-funds-after')}>
            <MoneyDisplay gold={after} color={after < 0 ? 'error.main' : undefined} />
          </Row>
        </>
      )}
    </Stack>
  );
};

export default PriceBreakdownView;
