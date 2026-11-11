import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@mui/material';
import { ManeuverProfileOverrides } from '../../api/maneuver-modifier.dto';
import KeyValuePanel, { KeyValueRow } from '../../display/KeyValuePanel';
import ManeuverOriginChip from './ManeuverOriginChip';

type ProfileField = keyof ManeuverProfileOverrides;

/**
 * Read-only maneuver profile of a skill or a skill category (spec 010): default type, result table, movement,
 * light usage and action points range. With `overrides` (the skill's own values) each row shows whether the
 * value is the skill's or inherited from the category. Renders nothing when the profile has no values.
 */
const ManeuverProfilePanel: FC<{
  /** Effective profile (a skill's `maneuver`) or the partial profile of a category. */
  profile?: ManeuverProfileOverrides;
  /** The skill's own values, to mark the origin of each row. */
  overrides?: ManeuverProfileOverrides;
  /** Panel title (default `t('maneuver-profile')`). */
  title?: string;
  /** Renders the rows without the panel. */
  bare?: boolean;
}> = ({ profile, overrides, title, bare = false }) => {
  const { t } = useTranslation();
  if (!profile) return null;

  const value = (field: ProfileField, text: ReactNode): ReactNode =>
    overrides ? (
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifyContent: 'flex-end' }}>
        <span>{text}</span>
        <ManeuverOriginChip origin={overrides[field] !== undefined ? 'skill' : 'category'} />
      </Stack>
    ) : (
      text
    );

  const rows: KeyValueRow[] = [];
  if (profile.defaultType !== undefined) {
    rows.push({
      label: t('default-maneuver-type'),
      value: value('defaultType', t(`maneuver-type-${profile.defaultType}`)),
    });
  }
  if (profile.resultTable !== undefined) {
    rows.push({
      label: t('result-table'),
      value: value('resultTable', t(profile.resultTable, { defaultValue: profile.resultTable })),
    });
  }
  if (profile.movement !== undefined) {
    rows.push({
      label: t('requires-movement'),
      hint: profile.movement ? t('maneuver-movement-hint') : undefined,
      value: value('movement', t(profile.movement ? 'yes' : 'no')),
    });
  }
  if (profile.light !== undefined) {
    rows.push({ label: t('light-usage'), value: value('light', t(`light-usage-${profile.light}`)) });
  }
  if (profile.actionPoints) {
    rows.push({
      label: t('action-points-range'),
      value: value('actionPoints', `${profile.actionPoints.min} - ${profile.actionPoints.max}`),
    });
  }
  if (rows.length === 0) return null;

  return <KeyValuePanel title={bare ? undefined : (title ?? t('maneuver-profile'))} rows={rows} />;
};

export default ManeuverProfilePanel;
