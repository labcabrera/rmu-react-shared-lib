import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { baseColors } from '../theme/tokens';
import RmuTextCard from './RmuTextCard';

const colorOf = (text: string) => getComputedStyle(screen.getByText(text)).color;
const rgb = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return `rgb(${r}, ${g}, ${b})`;
};

describe('RmuTextCard', () => {
  it('renders the value and the subtitle', () => {
    renderWithProviders(<RmuTextCard value="Arming sword" subtitle="Weapon" image={null} />);
    expect(screen.getByText('Arming sword')).toBeInTheDocument();
    expect(screen.getByText('Weapon')).toBeInTheDocument();
  });

  // Regression: color="green" returned the red color.
  it('uses the success color for green and the error color for red', () => {
    renderWithProviders(
      <>
        <RmuTextCard value="Green" color="green" applyColor subtitle={undefined} image={null} />
        <RmuTextCard value="Red" color="red" applyColor subtitle={undefined} image={null} />
      </>
    );
    expect(colorOf('Green')).toBe(rgb(baseColors.dark.success));
    expect(colorOf('Red')).toBe(rgb(baseColors.dark.error));
  });

  it('colors numeric values by sign when applyColor is set', () => {
    renderWithProviders(
      <>
        <RmuTextCard value={8} applyColor subtitle="Strength" image={null} />
        <RmuTextCard value={-8} applyColor subtitle="Empathy" image={null} />
      </>
    );
    expect(colorOf('8')).toBe(rgb(baseColors.dark.success));
    expect(colorOf('-8')).toBe(rgb(baseColors.dark.error));
  });

  it('is a button only when it is clickable', () => {
    const onClick = vi.fn();
    renderWithProviders(
      <>
        <RmuTextCard value="Clickable" subtitle={undefined} image={null} onClick={onClick} />
        <RmuTextCard value="Static" subtitle={undefined} image={null} />
      </>
    );
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Clickable');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
