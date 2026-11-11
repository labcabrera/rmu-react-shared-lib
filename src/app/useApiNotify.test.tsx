import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError, ConfirmCancelledError } from '../data/api-error';
import { renderWithProviders } from '../test/render';
import { NotificationProvider, useApiNotify } from './NotificationProvider';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => (options?.limit ? `${key}:${options.limit}` : key),
    i18n: { exists: (key: string) => key === 'err-known' },
  }),
}));

const Trigger = ({ error }: { error: unknown }) => {
  const notify = useApiNotify();
  return <button onClick={() => notify.error(error)}>fail</button>;
};

const show = async (error: unknown) => {
  renderWithProviders(
    <NotificationProvider>
      <Trigger error={error} />
    </NotificationProvider>
  );
  await userEvent.click(screen.getByText('fail'));
};

describe('useApiNotify', () => {
  it('shows a known err- code translated and filled with its details', async () => {
    await show(new ApiError(400, '', '{"code":"err-known","message":"english","details":{"limit":3}}', '/x'));
    expect(await screen.findByRole('alert')).toHaveTextContent('err-known:3');
  });

  it('falls back to the usual text for a code without translation', async () => {
    await show(new ApiError(400, '', '{"code":"err-unknown","message":"english"}', '/x'));
    expect(await screen.findByRole('alert')).toHaveTextContent('error-bad-request: english');
  });

  it('does not report a declined confirmation', async () => {
    await show(new ConfirmCancelledError());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
