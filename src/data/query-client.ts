import { QueryClient } from '@tanstack/react-query';
import { isApiError } from './api-error';

const isClientError = (error: unknown) => isApiError(error) && error.status >= 400 && error.status < 500;

/**
 * Workspace spec 091: the client of the data cache, created by the shell and shared with the remotes. A read is retried
 * once unless the API rejected it, and nothing is fetched again on its own when the window recovers the focus.
 */
export const createRmuQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: (failures, error) => failures < 1 && !isClientError(error),
      },
      mutations: { retry: false },
    },
  });
