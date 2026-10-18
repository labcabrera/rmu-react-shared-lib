import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../data/api-error';
import { renderWithProviders } from '../test/render';
import { ErrorBoundary } from './ErrorBoundary';
import MfeRoot from './MfeRoot';
import { NotificationProvider, useError, useNotify } from './NotificationProvider';

const Trigger = ({ error }: { error: unknown }) => {
  const notify = useNotify();
  return <button onClick={() => notify.error(error)}>fail</button>;
};

describe('NotificationProvider', () => {
  it('shows an ApiError as its message key plus the API detail', async () => {
    renderWithProviders(
      <NotificationProvider>
        <Trigger error={new ApiError(404, 'Not Found', '{"message":"Item not found"}', '/x')} />
      </NotificationProvider>
    );
    await userEvent.click(screen.getByText('fail'));
    expect(await screen.findByRole('alert')).toHaveTextContent('error-not-found: Item not found');
  });

  it('keeps the former ErrorContext contract', async () => {
    const Legacy = () => {
      const { showError } = useError();
      return <button onClick={() => showError('API request failed: 500')}>legacy</button>;
    };
    renderWithProviders(
      <NotificationProvider>
        <Legacy />
      </NotificationProvider>
    );
    await userEvent.click(screen.getByText('legacy'));
    expect(await screen.findByRole('alert')).toHaveTextContent('API request failed: 500');
  });

  it('fails clearly outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Trigger error="x" />)).toThrow(/NotificationProvider/);
  });
});

describe('ErrorBoundary and MfeRoot', () => {
  const Boom = (): React.ReactElement => {
    throw new Error('render failed');
  };

  it('renders the error state instead of crashing, and retries', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderWithProviders(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('render failed');
    expect(screen.getByRole('button', { name: 'retry' })).toBeInTheDocument();
  });

  it('MfeRoot isolates a failing page and provides notifications', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <MemoryRouter>
        <MfeRoot>
          <Boom />
        </MfeRoot>
      </MemoryRouter>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('something-went-wrong');
    await act(async () => {});
  });
});
