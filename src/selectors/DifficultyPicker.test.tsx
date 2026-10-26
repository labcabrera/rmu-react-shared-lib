import React from 'react';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SkillDifficultyGuide } from '../api/skill-difficulty.dto';
import { renderWithProviders } from '../test/render';
import DifficultyPicker from './DifficultyPicker';

// Fixture texts, not the rulebook ones
const GUIDE: SkillDifficultyGuide = {
  skillId: 'climbing',
  fallback: false,
  examples: [
    { difficulty: 'r', text: { en: 'a ladder' } },
    { difficulty: 'h', text: { en: 'a rough wall' } },
  ],
};

describe('DifficultyPicker', () => {
  it('chooses a difficulty with a chip', async () => {
    const onChange = vi.fn();
    renderWithProviders(<DifficultyPicker value="m" onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'difficulty-h -10' }));
    expect(onChange).toHaveBeenCalledWith('h');
    expect(screen.queryByTestId('difficulty-guide')).toBeNull();
  });

  it('shows the example of the chosen difficulty, or says there is none', () => {
    const { rerender } = renderWithProviders(<DifficultyPicker value="h" onChange={vi.fn()} guide={GUIDE} />);
    expect(within(screen.getByTestId('difficulty-guide')).getByText('a rough wall')).toBeTruthy();
    rerender(<DifficultyPicker value="m" onChange={vi.fn()} guide={GUIDE} />);
    expect(within(screen.getByTestId('difficulty-guide')).getByText('difficulty-guide-no-example')).toBeTruthy();
  });

  it('keeps the difficulty as the name of a chip with an example', () => {
    renderWithProviders(<DifficultyPicker value="m" onChange={vi.fn()} guide={GUIDE} />);
    expect(screen.getByRole('radio', { name: 'difficulty-h -10' })).toBeTruthy();
  });

  it('opens the whole scale and chooses a difficulty from it', async () => {
    const onChange = vi.fn();
    renderWithProviders(<DifficultyPicker value="m" onChange={onChange} guide={GUIDE} />);
    await userEvent.click(screen.getByRole('button', { name: 'difficulty-guide-show-all' }));
    await userEvent.click(screen.getByText('a ladder'));
    expect(onChange).toHaveBeenCalledWith('r');
  });
});
