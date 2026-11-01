import type { TFunction } from 'i18next';
import type { GameCalendar } from '../api/strategic-game.dto';

type Translate = TFunction | ((...args: [string, object?]) => string);

/** Day of the campaign (spec 065): "Day 37 · since 3 Víressë, 1640 T.A.", or only the day without a start date. */
export function formatCampaignDate(calendar: GameCalendar | undefined, t: Translate): string {
  const day = calendar?.currentDay ?? 1;
  const dayText = t('campaign-day', { day });
  const start = calendar?.startDate?.trim();
  return start ? `${dayText} · ${t('campaign-since', { date: start })}` : dayText;
}

/** Days and hours as text for the time steps: "3 days 8 hours". */
export function formatElapsedTime(days: number, hours: number, t: Translate): string {
  const parts: string[] = [];
  if (days > 0) parts.push(t('days-count', { count: days }));
  if (hours > 0) parts.push(t('hours-count', { count: hours }));
  return parts.join(' ');
}
