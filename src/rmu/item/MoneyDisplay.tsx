import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography, TypographyProps } from '@mui/material';
import { imageBaseUrl } from '../../config/config.service';
import { Coin, toCoins } from './money';

const COIN_COLORS: Record<Coin, string> = { gp: '#d4a017', sp: '#b0b7bf', bp: '#b08d57', cp: '#b87333' };

/**
 * An amount of gold as coins (gp, sp, bp, cp; spec 023). `signed` shows a + on income, and a negative amount is drawn
 * as an expense.
 */
const MoneyDisplay: FC<{
  gold: number;
  signed?: boolean;
  showIcon?: boolean;
  variant?: TypographyProps['variant'];
  color?: string;
}> = ({ gold, signed = false, showIcon = false, variant = 'body2', color }) => {
  const { t } = useTranslation();
  const parts = toCoins(gold);
  const text = parts.map((part) => `${Math.abs(part.amount)} ${t(`coin-${part.coin}`)}`).join(' ');
  const prefix = gold < 0 ? '−' : signed && gold > 0 ? '+' : '';
  const tone = color ?? (signed ? (gold < 0 ? 'error.main' : gold > 0 ? 'success.main' : undefined) : undefined);
  return (
    <Stack
      direction="row"
      spacing={0.5}
      component="span"
      sx={{ alignItems: 'center', display: 'inline-flex' }}
      aria-label={`${prefix}${text}`}
    >
      {showIcon && (
        <img src={`${imageBaseUrl}images/icons/coins.png`} alt="" width={18} height={18} style={{ opacity: 0.85 }} />
      )}
      <Typography variant={variant} component="span" sx={{ fontWeight: 600, color: tone, whiteSpace: 'nowrap' }}>
        {prefix}
        {parts.map((part, index) => (
          <Typography key={part.coin} component="span" variant={variant} sx={{ fontWeight: 600, color: 'inherit' }}>
            {index > 0 ? ' ' : ''}
            {Math.abs(part.amount)}
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 0.25, color: tone ? 'inherit' : COIN_COLORS[part.coin], fontWeight: 700 }}
            >
              {t(`coin-${part.coin}`)}
            </Typography>
          </Typography>
        ))}
      </Typography>
    </Stack>
  );
};

export default MoneyDisplay;
