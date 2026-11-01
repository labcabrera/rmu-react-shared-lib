// Grid presets shared by every MFE (they were copied in each one's services/display.ts).
/**
 * Columns of a grid of entity cards by the width the grid really has (spec 059, decision 1): one below 560 px, then
 * 2, 3, 4 and 5. At full width that gives 5 cards per row without a filter panel (~1438 px) and 3 with it (~1142 px),
 * with tens of px of margin before the next step; grids inside other views follow their own width.
 */
export const cardColumns = [
  { minWidth: 560, columns: 2 },
  { minWidth: 880, columns: 3 },
  { minWidth: 1200, columns: 4 },
  { minWidth: 1300, columns: 5 },
] as const;

/** The element whose width the card grid follows: wrap the grid (cardGridSx) in it. */
export const cardGridContainerSx = { containerType: 'inline-size', width: '100%' } as const;

/** CSS grid of entity cards, inside a cardGridContainerSx element: columns by the container's width (cardColumns). */
export const cardGridSx = () => ({
  display: 'grid',
  gap: 1,
  gridTemplateColumns: 'minmax(0, 1fr)',
  ...Object.fromEntries(
    cardColumns.map(({ minWidth, columns }) => [
      `@container (min-width: ${minWidth}px)`,
      { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
    ])
  ),
});

export const gridSizeCard = { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 } as const;

// Image filters for item illustrations.
export const itemFilter = 'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(1) contrast(0.75)';
export const itemFilterDisabled =
  'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(0.25) contrast(0.75)';
