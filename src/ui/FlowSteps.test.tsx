import React from 'react';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import FlowSteps from './FlowSteps';

const flow = (reviewInteractive?: boolean) =>
  renderWithProviders(
    <FlowSteps
      steps={[
        { id: 'roll', label: 'Roll', content: <button>explain</button>, reviewInteractive },
        { id: 'result', label: 'Result' },
      ]}
      activeIndex={1}
      reviewing="roll"
      onReview={() => undefined}
    />
  );

describe('FlowSteps review (spec 052)', () => {
  it('keeps a reviewed done step read-only', () => {
    flow();
    expect(screen.getByText('explain').closest('[inert]')).not.toBeNull();
  });

  it('leaves the explanations of a results step open to a click', () => {
    flow(true);
    expect(screen.getByText('explain').closest('[inert]')).toBeNull();
  });
});
