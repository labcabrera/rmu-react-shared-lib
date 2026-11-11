import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Stack, Typography } from '@mui/material';
import type { GemMagic, ItemGemSetting } from '../../api/magic-item.dto';
import type { ItemGem } from '../../api/treasure-goods.dto';
import ChipRow from '../../display/ChipRow';
import { KeyValueList, KeyValueRow } from '../../display/KeyValuePanel';
import Panel from '../../layouts/Panel';
import MoneyDisplay from '../item/MoneyDisplay';

export type GemTraitsProps = {
  /** The `features.gem` block of a catalog gem. */
  gem?: Pick<ItemGem, 'magic'> | null;
  /** A gem set in an item: its name, carats, cut and value are shown too. */
  setting?: ItemGemSetting | null;
  /** The traits alone, when there is neither. */
  magic?: GemMagic | null;
  /** Panel title: the name of the set gem, or `gem-traits`. */
  title?: string;
  bare?: boolean;
  /** Controls on the panel title row (take the gem out). */
  extra?: ReactNode;
  dense?: boolean;
};

const hasTraits = (magic: GemMagic | null | undefined): magic is GemMagic =>
  !!magic && (!!magic.spells || !!magic.stats?.length || !!magic.skills || !!magic.other);

/**
 * The magic traits of a gem (Treasure Law table 2-4f; spec 067): spells, stats, skills and other powers, of a
 * catalog gem or of a gem set in an item. Nothing when the gem has no traits and is not a set gem.
 */
const GemTraits: FC<GemTraitsProps> = ({ gem, setting, magic, title, bare = false, extra, dense = false }) => {
  const { t } = useTranslation();
  const traits = setting ? setting.magic : gem ? gem.magic : magic;
  if (!setting && !hasTraits(traits)) return null;

  const rows: KeyValueRow[] = [];
  if (setting) {
    if (setting.carats !== null)
      rows.push({ label: t('gem-carats'), value: t('gem-carats-value', { count: setting.carats }) });
    rows.push({
      label: t('gem-cut'),
      value:
        setting.cutFactor && setting.cutFactor > 1
          ? t('gem-cut-factor-value', { value: setting.cutFactor })
          : t('gem-cut-none'),
    });
    rows.push({ label: t('value'), value: <MoneyDisplay gold={setting.value} /> });
  }
  if (traits?.spells) rows.push({ label: t('gem-magic-spells'), value: traits.spells });
  if (traits?.skills) rows.push({ label: t('gem-magic-skills'), value: traits.skills });
  if (traits?.other) rows.push({ label: t('gem-magic-other'), value: traits.other });
  const stats = traits?.stats ?? [];

  const content = (
    <Stack spacing={1}>
      {rows.length > 0 && <KeyValueList rows={rows} dense={dense} />}
      {stats.length > 0 && (
        <Stack spacing={0.5}>
          <Typography variant="body2" color={dense ? 'text.secondary' : undefined}>
            {t('gem-magic-stats')}
          </Typography>
          <ChipRow>
            {stats.map((stat) => (
              <Chip key={stat} size="small" variant="outlined" label={t(stat)} />
            ))}
          </ChipRow>
        </Stack>
      )}
    </Stack>
  );
  if (bare) return content;
  return (
    <Panel
      variant="outlined"
      dense={dense}
      title={title ?? (setting ? t(setting.name, { defaultValue: setting.name }) : t('gem-traits'))}
      extra={extra}
    >
      {content}
    </Panel>
  );
};

export default GemTraits;
