import { describe, expect, it } from 'vitest';
import { formatCampaignDate, formatElapsedTime } from './campaign-date';

const t = (key: string, options?: object) => `${key}${options ? JSON.stringify(options) : ''}`;

describe('formatCampaignDate', () => {
  it('shows the day and the start date', () => {
    const calendar = { startDate: 'Spring', elapsedDays: 36, elapsedHours: 0, currentDay: 37 };
    expect(formatCampaignDate(calendar, t)).toBe('campaign-day{"day":37} · campaign-since{"date":"Spring"}');
  });

  it('shows only the day without a start date, and day 1 without a calendar', () => {
    expect(formatCampaignDate({ startDate: ' ', elapsedDays: 0, elapsedHours: 5, currentDay: 1 }, t)).toBe(
      'campaign-day{"day":1}'
    );
    expect(formatCampaignDate(undefined, t)).toBe('campaign-day{"day":1}');
  });
});

describe('formatElapsedTime', () => {
  it('joins days and hours, leaving out the zeros', () => {
    expect(formatElapsedTime(3, 8, t)).toBe('days-count{"count":3} hours-count{"count":8}');
    expect(formatElapsedTime(0, 8, t)).toBe('hours-count{"count":8}');
    expect(formatElapsedTime(2, 0, t)).toBe('days-count{"count":2}');
  });
});
