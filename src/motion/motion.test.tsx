import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import { useViewTransitionNavigate, viewTransitionName } from './motion';

const Navigator = () => {
  const navigate = useViewTransitionNavigate();
  const { pathname } = useLocation();
  return (
    <>
      <span>{pathname}</span>
      <button onClick={() => navigate('/items/view/1')}>go</button>
    </>
  );
};

const renderNavigator = () =>
  renderWithProviders(
    <Routes>
      <Route path="*" element={<Navigator />} />
    </Routes>
  );

describe('viewTransitionName', () => {
  it('joins the parts into a valid CSS identifier and skips empty ones', () => {
    expect(viewTransitionName('item', 'a1:b/2', undefined, '')).toBe('item-a1_b_2');
  });
});

describe('useViewTransitionNavigate', () => {
  afterEach(() => {
    delete (document as { startViewTransition?: unknown }).startViewTransition;
  });

  it('navigates directly when the browser has no View Transitions', () => {
    renderNavigator();
    fireEvent.click(screen.getByText('go'));
    expect(screen.getByText('/items/view/1')).toBeInTheDocument();
  });

  it('runs the navigation inside a View Transition when available', () => {
    const start = vi.fn((update: () => void) => update());
    (document as { startViewTransition?: unknown }).startViewTransition = start;
    renderNavigator();
    fireEvent.click(screen.getByText('go'));
    expect(start).toHaveBeenCalledOnce();
    expect(screen.getByText('/items/view/1')).toBeInTheDocument();
  });
});
