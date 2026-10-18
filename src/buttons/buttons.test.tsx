import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import AddButton from './AddButton';
import BackButton from './BackButton';
import CancelButton from './CancelButton';
import ClearButton from './ClearButton';
import DeleteButton from './DeleteButton';
import DownloadButton from './DownloadButton';
import EditButton from './EditButton';
import NextButton from './NextButton';
import RefreshButton from './RefreshButton';
import SaveButton from './SaveButton';

// Regression: the wrappers passed `aria-label=` instead of `ariaLabel`, so every button was announced as "action".
describe('icon button wrappers', () => {
  it.each([
    ['add', AddButton],
    ['back', BackButton],
    ['cancel', CancelButton],
    ['clear', ClearButton],
    ['delete', DeleteButton],
    ['download', DownloadButton],
    ['edit', EditButton],
    ['next', NextButton],
    ['refresh', RefreshButton],
    ['save', SaveButton],
  ])('exposes the "%s" accessible name', (label, Button) => {
    renderWithProviders(<Button onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
  });

  it('can be disabled', () => {
    renderWithProviders(<SaveButton onClick={vi.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'save' })).toBeDisabled();
  });
});
