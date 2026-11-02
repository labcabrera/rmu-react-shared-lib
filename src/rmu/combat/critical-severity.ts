/**
 * Colour of a critical severity (spec 066, from the attack table chart of core): grey without a critical, A to E
 * warmer, F-I darker. Shared so the chart and the combat show the same colour.
 */
export const CRITICAL_SEVERITY_COLORS: Record<string, string> = {
  none: '#9e9e9e',
  A: '#fdd835',
  B: '#ffb300',
  C: '#fb8c00',
  D: '#f4511e',
  E: '#d32f2f',
  F: '#b71c1c',
  G: '#880e4f',
  H: '#4a148c',
  I: '#1a237e',
};

export const criticalSeverityColor = (severity: string | null | undefined): string =>
  CRITICAL_SEVERITY_COLORS[severity ?? 'none'] ?? CRITICAL_SEVERITY_COLORS.none;

/** Severities of the legend, in order. */
export const CRITICAL_SEVERITY_LEGEND = ['none', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];

/** Text colour readable on a severity background. */
export const criticalSeverityTextColor = (severity: string | null | undefined): string =>
  ['A', 'B', 'none'].includes(severity ?? 'none') ? 'rgba(0, 0, 0, 0.87)' : '#fff';
