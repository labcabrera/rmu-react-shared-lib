import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('shows the abbreviation and value, and the full name to screen readers', () => {
    renderWithProviders(<StatusBadge status="stunned" label="Stunned" abbr="Stun" value="2r" color="error" />);

    expect(screen.getByText('Stun 2r')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Stunned 2r' })).toBeInTheDocument();
  });

  it('falls back to the full name without an abbreviation or an image', () => {
    renderWithProviders(<StatusBadge status="unknown-status" label="Something" />);

    expect(screen.getByText('Something')).toBeInTheDocument();
  });

  it('opens the explanation on click without reaching the row around it', () => {
    const onRowClick = vi.fn();
    renderWithProviders(
      <div onClick={onRowClick}>
        <StatusBadge status="dead" label="Dead" abbr="D" detail="Gone for good." />
      </div>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dead' }));

    expect(screen.getByRole('dialog', { name: 'Dead' })).toHaveTextContent('Gone for good.');
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
