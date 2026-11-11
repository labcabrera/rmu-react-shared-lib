import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import AddButton from './AddButton';
import CancelButton from './CancelButton';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import EditButton from './EditButton';
import RefreshButton from './RefreshButton';

// Regression: the wrappers passed `aria-label=` instead of `ariaLabel`, so every button was announced as "action".
describe('icon button wrappers', () => {
  it.each([
    ['add', AddButton],
    ['cancel', CancelButton],
    ['delete', DeleteButton],
    ['download', DownloadButton],
    ['edit', EditButton],
    ['refresh', RefreshButton],
  ])('exposes the "%s" accessible name', (label, Button) => {
    renderWithProviders(<Button onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });

  it('can be disabled', () => {
    renderWithProviders(<EditButton onClick={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'edit' })).toBeDisabled();
  });
});
