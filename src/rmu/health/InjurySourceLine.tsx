import React, { FC, Fragment, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import { InjurySource } from '../../api/health.dto';

/**
 * Where an injury comes from, in one caption line: kind and critical key, attacker, round and tactical game.
 * `renderGameLink` turns the game name into a link (e.g. a router link to the tactical game).
 */
const InjurySourceLine: FC<{
  source: InjurySource;
  renderGameLink?: (tacticalGameId: string, label: string) => ReactNode;
}> = ({ source, renderGameLink }) => {
  const { t } = useTranslation();
  const parts: ReactNode[] = [];

  parts.push(
    source.criticalKey
      ? `${t(`injury-source-${source.kind}`)} ${source.criticalKey}`
      : t(`injury-source-${source.kind}`)
  );
  if (source.attackerName) parts.push(`${t('attacker')}: ${source.attackerName}`);
  if (source.round !== undefined && source.round !== null) parts.push(`${t('round')} ${source.round}`);
  if (source.tacticalGameId || source.tacticalGameName) {
    const gameName = source.tacticalGameName || source.tacticalGameId || '';
    const label = `${t('tactical-game')}: ${gameName}`;
    parts.push(renderGameLink && source.tacticalGameId ? renderGameLink(source.tacticalGameId, label) : label);
  }

  return (
    <Typography variant="caption" color="text.secondary" component="div">
      {parts.map((part, index) => (
        <Fragment key={index}>
          {index > 0 && ' · '}
          {part}
        </Fragment>
      ))}
    </Typography>
  );
};

export default InjurySourceLine;
