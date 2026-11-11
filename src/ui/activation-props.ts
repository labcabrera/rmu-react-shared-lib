import { KeyboardEvent } from 'react';

/** Workspace spec 091, F2: what makes a clickable row reachable and usable with the keyboard. */
export const activationProps = (activate: () => void) => ({
  tabIndex: 0,
  onKeyDown: (event: KeyboardEvent) => {
    // The controls inside the row handle their own keys.
    if (event.target !== event.currentTarget || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    activate();
  },
});
