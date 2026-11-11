import { useMediaQuery, useTheme } from '@mui/material';

/** True below the `sm` breakpoint (phones), where the templates use FABs, bottom bars and sheets. */
export const usePhone = (): boolean => {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down('sm'));
};

/**
 * Bottom offset for fixed elements on phones: the shell sets --rmu-bottom-nav-height while its bottom
 * navigation is visible, so FABs and save bars sit above it.
 */
export const bottomOffset = (extra = 0) => `calc(${extra}px + var(--rmu-bottom-nav-height, 0px))`;
