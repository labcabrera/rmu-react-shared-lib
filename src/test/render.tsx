import React, { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import { createAppTheme, ThemeMode } from '../theme/createAppTheme';

/** Renders a component with the providers every lib component expects (theme and router), also on rerender. */
export const renderWithProviders = (ui: ReactElement, mode: ThemeMode = 'dark') =>
  render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <ThemeProvider theme={createAppTheme(mode)}>
        <MemoryRouter>{children}</MemoryRouter>
      </ThemeProvider>
    ),
  });
