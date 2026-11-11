// Grid presets shared by every MFE (they were copied in each one's services/display.ts).
/**
 * Columns of a grid of entity cards by the width the grid really has (spec 059, decision 1): one below 560 px, then
 * 2, 3, 4 and 5. At full width that gives 5 cards per row (~1438 px). A side filter panel takes one of those columns
 * (sideFilterGridSx), so the cards keep their size with the panel shown or hidden; grids inside other views follow
 * their own width.
 */
export const cardColumns = [
  { minWidth: 560, columns: 2 },
  { minWidth: 880, columns: 3 },
  { minWidth: 1200, columns: 4 },
  { minWidth: 1300, columns: 5 },
] as const;

/** The element whose width the card grid follows: wrap the grid (cardGridSx) in it. */
export const cardGridContainerSx = { containerType: 'inline-size', width: '100%' } as const;

/**
 * CSS custom property that fixes the columns of the card grids inside an element: set by sideFilterGridSx on the
 * results, so they have the columns the whole width would have, less the one of the panel.
 */
export const CARD_COLUMNS_VAR = '--rmu-card-columns';

/** Gap between the cards, and between the filter panel and the cards (theme spacing units). */
const CARD_GAP = 1;

/**
 * CSS grid of entity cards, inside a cardGridContainerSx element: columns by the container's width (cardColumns),
 * unless an ancestor fixes them with CARD_COLUMNS_VAR.
 */
export const cardGridSx = () => ({
  display: 'grid',
  gap: CARD_GAP,
  gridTemplateColumns: `repeat(var(${CARD_COLUMNS_VAR}, 1), minmax(0, 1fr))`,
  ...Object.fromEntries(
    cardColumns.map(({ minWidth, columns }) => [
      `@container (min-width: ${minWidth}px)`,
      { gridTemplateColumns: `repeat(var(${CARD_COLUMNS_VAR}, ${columns}), minmax(0, 1fr))` },
    ])
  ),
});

/**
 * A side filter panel and the results, inside a cardGridContainerSx element: the same columns as a card grid of the
 * whole width, the panel in the first one and the results in the rest, with one column less for their cards. Below
 * three columns the panel goes above the results. `panel` and `results` are the sx of each part.
 */
export const sideFilterGridSx = () => ({
  grid: {
    display: 'grid',
    gap: CARD_GAP,
    alignItems: 'start',
    gridTemplateColumns: 'minmax(0, 1fr)',
    ...Object.fromEntries(
      cardColumns
        .filter(({ columns }) => columns >= 3)
        .map(({ minWidth, columns }) => [
          `@container (min-width: ${minWidth}px)`,
          { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` },
        ])
    ),
  },
  panel: { minWidth: 0 },
  results: {
    minWidth: 0,
    ...Object.fromEntries(
      cardColumns
        .filter(({ columns }) => columns >= 3)
        .map(({ minWidth, columns }) => [
          `@container (min-width: ${minWidth}px)`,
          { gridColumn: '2 / -1', [CARD_COLUMNS_VAR]: columns - 1 },
        ])
    ),
  },
});

export const gridSizeCard = { xs: 12, sm: 6, md: 4, lg: 3, xl: 3 } as const;

// Image filters for item illustrations.
export const itemFilter = 'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(1) contrast(0.75)';
export const itemFilterDisabled =
  'grayscale(90%) sepia(90%) hue-rotate(0deg) saturate(80%) brightness(0.25) contrast(0.75)';
