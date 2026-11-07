import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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

describe('FlowSteps scrolling (spec 085)', () => {
  const steps = [
    { id: 'a', label: 'A', content: <span>first</span> },
    { id: 'b', label: 'B', content: <input data-roll-input="" aria-label="roll" defaultValue="" /> },
  ];

  it('scrolls the new current step into view and focuses its empty roll', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { rerender } = renderWithProviders(<FlowSteps steps={steps} activeIndex={0} />);
    expect(scroll).not.toHaveBeenCalled();
    rerender(<FlowSteps steps={steps} activeIndex={1} />);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('roll')).toHaveFocus();
  });

  it('stays still when autoScroll is off', () => {
    const scroll = vi.fn();
    Element.prototype.scrollIntoView = scroll;
    const { rerender } = renderWithProviders(<FlowSteps steps={steps} activeIndex={0} autoScroll={false} />);
    rerender(<FlowSteps steps={steps} activeIndex={1} autoScroll={false} />);
    expect(scroll).not.toHaveBeenCalled();
  });
});

describe('FlowSteps horizontal (spec 085)', () => {
  const steps = [
    { id: 'targets', label: 'Targets', summary: 'Orc', content: <input aria-label="target" /> },
    { id: 'roll', label: 'Roll', content: <span>roll content</span> },
    { id: 'result', label: 'Result', content: <span>result content</span> },
  ];

  it('shows the steps in a bar and only the content of the current step', () => {
    renderWithProviders(<FlowSteps orientation="horizontal" steps={steps} activeIndex={1} />);
    expect(screen.getByText('Targets')).toBeInTheDocument();
    expect(screen.getByText('Orc')).toBeInTheDocument();
    expect(screen.getByText('Result')).toBeInTheDocument();
    expect(screen.getByText('roll content')).toBeInTheDocument();
    expect(screen.queryByText('result content')).toBeNull();
    expect(screen.queryByLabelText('target')).toBeNull();
  });

  it('reviews a done step read-only from the bar and goes back to the current one', () => {
    const onReview = vi.fn();
    const { rerender } = renderWithProviders(
      <FlowSteps orientation="horizontal" steps={steps} activeIndex={1} onReview={onReview} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Targets' }));
    expect(onReview).toHaveBeenCalledWith('targets');
    rerender(
      <FlowSteps orientation="horizontal" steps={steps} activeIndex={1} reviewing="targets" onReview={onReview} />
    );
    expect(screen.getByLabelText('target').closest('[inert]')).not.toBeNull();
    expect(screen.queryByText('roll content')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /flow-back-to-step/ }));
    expect(onReview).toHaveBeenLastCalledWith(null);
  });
});
