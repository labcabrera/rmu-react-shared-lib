import { useCallback } from 'react';
import { flushSync } from 'react-dom';
import { NavigateOptions, To, useNavigate } from 'react-router-dom';
import { keyframes, SxProps, Theme } from '@mui/material';

/** One style (object or theme function), so it can go inside an `sx` array. */
type ThemedStyle = Exclude<SxProps<Theme>, ReadonlyArray<unknown>>;

const enter = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
`;

/** Items after this one enter together, so long lists do not keep animating. */
const MAX_STAGGERED = 12;
const STAGGER_MS = 30;

/**
 * Fade and rise on mount. `index` staggers siblings (cards of a grid). The global reduced-motion rule
 * of the theme cuts it to nothing.
 */
export const enterSx =
  (index = 0): ThemedStyle =>
  (theme: Theme) => ({
    animation: `${enter} ${theme.motion.duration.base}ms ${theme.motion.easing.emphasized} both`,
    animationDelay: `${Math.min(index, MAX_STAGGERED) * STAGGER_MS}ms`,
  });

/** Lift and accent border on hover, for clickable cards. */
export const hoverLiftSx: ThemedStyle = (theme: Theme) => ({
  transition: ['box-shadow', 'border-color', 'transform']
    .map((p) => `${p} ${theme.motion.duration.fast}ms ${theme.motion.easing.standard}`)
    .join(', '),
  '&:hover': { transform: 'translateY(-2px)', boxShadow: 6, borderColor: 'primary.main' },
});

/**
 * `view-transition-name` for an element that should morph between pages (a card image and the detail
 * header image of the same entity). Names must be unique on the page and a valid CSS identifier.
 */
export const viewTransitionName = (...parts: (string | number | undefined | null)[]) =>
  parts
    .filter((part) => part !== undefined && part !== null && part !== '')
    .join('-')
    .replace(/[^a-zA-Z0-9_-]/g, '_');

type StartViewTransition = (update: () => void) => unknown;

const startViewTransition = (): StartViewTransition | undefined => {
  if (typeof document === 'undefined') return undefined;
  const start = (document as Document & { startViewTransition?: StartViewTransition }).startViewTransition;
  if (typeof start !== 'function') return undefined;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
  return start.bind(document);
};

/**
 * `navigate` wrapped in a View Transition. React Router only animates navigations of data routers,
 * and the shell and the remotes use declarative `<Routes>`, so the transition is started here. Without
 * browser support or with reduced motion it is a plain navigation.
 */
export const useViewTransitionNavigate = () => {
  const navigate = useNavigate();
  return useCallback(
    (to: To, options?: NavigateOptions) => {
      const start = startViewTransition();
      if (!start) return navigate(to, options);
      start(() => flushSync(() => navigate(to, options)));
    },
    [navigate]
  );
};
