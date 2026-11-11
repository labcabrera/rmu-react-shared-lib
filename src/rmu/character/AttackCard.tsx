import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Card, CardContent, Chip, Stack, Tooltip, Typography } from '@mui/material';
import { CharacterAttack } from '../../api/character.dto';
import AttackSizeChip from '../combat/AttackSizeChip';
import { formatBonus } from './StatPill';

const Detail = ({ label, value }: { label: string; value: string | number }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="caption" color="text.secondary" component="div" noWrap>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
      {value}
    </Typography>
  </Box>
);

/**
 * One attack: offensive bonus first, then its tables and modifiers. `dense` hides the details, but not a size other
 * than Medium nor a weapon of another size (workspace spec 075).
 */
const AttackCard: FC<{
  attack: CharacterAttack;
  dense?: boolean;
  /** Formatted melee range (units and board scale), instead of the raw number. */
  meleeRangeLabel?: string;
  /** Formatted fumble range, instead of the raw number. */
  fumbleLabel?: string;
}> = ({ attack, dense = false, meleeRangeLabel, fumbleLabel }) => {
  const { t } = useTranslation();
  const modifiers = Object.entries(attack.boModifiers ?? {}).filter(([, value]) => value !== 0);
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }} noWrap>
                {t(attack.attackName)}
              </Typography>
              {attack.defaultAttack && (
                <Tooltip title={t('default-attack')}>
                  <StarIcon fontSize="inherit" color="primary" aria-label={t('default-attack')} />
                </Tooltip>
              )}
            </Stack>
            <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 0.5, alignItems: 'center' }}>
              <Chip label={t(attack.type)} size="small" variant="outlined" />
              <AttackSizeChip steps={attack.sizeAdjustment} />
              {attack.wrongSize && (
                <Tooltip title={t('wrong-size-hint')}>
                  <Chip
                    size="small"
                    color="warning"
                    icon={<WarningAmberIcon />}
                    label={t('wrong-size')}
                    aria-label={t('wrong-size-hint')}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
          <Tooltip title={t('offensive-bonus')}>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="h4" component="div" sx={{ lineHeight: 1, color: 'primary.main' }}>
                {formatBonus(attack.bo)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t('bo')}
              </Typography>
            </Box>
          </Tooltip>
        </Stack>
        {!dense && (
          <>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 1, mt: 2 }}>
              <Detail label={t('attack-table')} value={t(attack.attackTable)} />
              <Detail label={t('fumble')} value={fumbleLabel ?? attack.fumble} />
              <Detail label={t('size-adjustment')} value={formatBonus(attack.sizeAdjustment)} />
              {attack.meleeRange !== null && (
                <Detail label={t('melee-range')} value={meleeRangeLabel ?? attack.meleeRange} />
              )}
            </Box>
            {modifiers.length > 0 && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5, mt: 1.5 }}>
                {modifiers.map(([key, value]) => (
                  <Chip
                    key={key}
                    size="small"
                    label={`${t(key)} ${formatBonus(value)}`}
                    sx={{ color: value < 0 ? 'stat.negative' : 'stat.positive' }}
                  />
                ))}
              </Stack>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AttackCard;
