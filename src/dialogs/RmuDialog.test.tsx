import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render';
import RmuDialog from './RmuDialog';

describe('RmuDialog (spec 085)', () => {
  it('closes from the title icon and hides the action bar', () => {
    const onDismiss = vi.fn();
    renderWithProviders(
      <RmuDialog open title="Elrand" subtitle={<span>status chip</span>} onDismiss={onDismiss} closeIcon hideActions>
        body
      </RmuDialog>
    );
    expect(screen.getByText('status chip')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^close$/i, hidden: false })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(document.querySelector('.MuiDialogActions-root')).toBeNull();
  });

  it('keeps the Close button by default', () => {
    renderWithProviders(
      <RmuDialog open title="Elrand" onClose={() => undefined}>
        body
      </RmuDialog>
    );
    expect(document.querySelector('.MuiDialogActions-root')).not.toBeNull();
  });
});
