import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import RollCard from './RollCard';

describe('RollCard (spec 085)', () => {
  it('shows the title, the status text, the total and its label', () => {
    renderWithProviders(
      <RollCard title="Attack roll" statusText="Enter the attack roll." total={70} totalLabel="Expected total">
        <span>extra</span>
      </RollCard>
    );
    expect(screen.getByRole('region', { name: 'Attack roll' })).toBeInTheDocument();
    expect(screen.getByText('Enter the attack roll.')).toBeInTheDocument();
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('Expected total')).toBeInTheDocument();
    expect(screen.getByText('extra')).toBeInTheDocument();
  });

  it('leaves the total out when there is none', () => {
    renderWithProviders(<RollCard title="Critical roll" status="done" total={null} />);
    expect(screen.queryByText('total')).toBeNull();
  });
});
