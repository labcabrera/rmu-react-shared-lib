// Grid presets shared by every MFE (they were copied in each one's services/display.ts).
/**
 * Minimum width of an entity card (spec 058, decision 3): every list fits as many columns of at least this width as
 * its space allows, so cards have about the same size with or without a filter panel next to them.
 */
export const cardMinWidth = 184;

/** CSS grid of entity cards: one column on phones (horizontal cards), then columns of at least `minWidth` px. */
export const cardGridSx = (minWidth: number = cardMinWidth) =>
  ({
    display: 'grid',
    gap: 1,
    gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: `repeat(auto-fill, minmax(${minWidth}px, 1fr))` },
  }) as const;

export const gridSizeCard = { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 } as const;
export const gridSizeResume = { xs: 12, sm: 12, md: 12, lg: 12, xl: 2 } as const;
export const gridSizeMain = { xs: 12, sm: 12, md: 12, lg: 12, xl: 9 } as const;

// Image filters for item illustrations.
export const itemFilter = 'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(1) contrast(0.75)';
export const itemFilterDisabled =
  'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(0.25) contrast(0.75)';
