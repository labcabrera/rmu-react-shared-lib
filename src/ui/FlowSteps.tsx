import React, { ReactNode, useEffect, useLayoutEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';
import { enterSx } from '../motion/motion';

export interface FlowStep {
  id: string;
  label: string;
  /** One-line summary shown once the step is done (for example "Orc 2 · DB 25 · AT 9"). */
  summary?: ReactNode;
  /** Body of the step while it is the current one (and of a done step while reviewed). */
  content?: ReactNode;
  /**
   * A reviewed done step is inert, so its inputs cannot change. A step that only shows results sets this to keep its
   * explanations (rule hints) open to a click or a tap.
   */
  reviewInteractive?: boolean;
}

type StepState = 'done' | 'current' | 'next';

/** What can be done from a reviewed done step, for example going back to edit it (workspace spec 101). */
export interface FlowReviewAction {
  label: string;
  onClick: () => void;
}

const ReviewActionButton = ({ action }: { action: FlowReviewAction }) => (
  <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={action.onClick}>
    {action.label}
  </Button>
);

const stepState = (index: number, activeIndex: number): StepState => {
  if (index < activeIndex) return 'done';
  return index === activeIndex ? 'current' : 'next';
};

const StepBadge = ({ index, state }: { index: number; state: StepState }) => (
  <Box
    sx={(theme) => ({
      width: 24,
      height: 24,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      fontSize: 12,
      fontWeight: 700,
      color: state === 'current' ? theme.palette.primary.contrastText : theme.palette.text.secondary,
      bgcolor: state === 'current' ? theme.palette.primary.main : 'transparent',
      border: state === 'current' ? 'none' : `1px solid ${theme.palette.divider}`,
    })}
  >
    {state === 'done' ? <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} /> : index + 1}
  </Box>
);

/** The closest ancestor that scrolls, where the sticky footer lives. */
const scrollParent = (element: HTMLElement | null): HTMLElement | null => {
  for (let node = element?.parentElement; node; node = node.parentElement) {
    const { overflowY } = getComputedStyle(node);
    if (overflowY === 'auto' || overflowY === 'scroll') return node;
  }
  return null;
};

/** The first roll of a step that has no value yet (a `RollField` marks its input with `data-roll-input`). */
const firstEmptyRoll = (root: HTMLElement): HTMLInputElement | undefined =>
  Array.from(root.querySelectorAll<HTMLInputElement>('input[data-roll-input]:not(:disabled)')).find(
    (input) => input.value === ''
  );

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Steps of a guided flow. Vertical (the default): done steps collapse into a one-line summary, the current step is
 * open, the next ones are greyed. Horizontal (spec 085, 3.6): the steps go in a bar that stays at the top, with the
 * summary of each done step under its name, and only the current step (or the one reviewed) is shown below it.
 * `footer` stays at the bottom of the scrolling panel (the step's main action). `reviewing` opens a done step
 * read-only, for example after clicking its summary, and `reviewAction` may add a button to it (go back and edit it).
 */
export default function FlowSteps({
  steps,
  activeIndex,
  footer,
  reviewing,
  onReview,
  reviewAction,
  autoScroll = true,
  orientation = 'vertical',
}: {
  steps: FlowStep[];
  /** Index of the current step; `steps.length` when the whole flow is done. */
  activeIndex: number;
  footer?: ReactNode;
  /** Id of a done step shown open, read-only. */
  reviewing?: string | null;
  /** Called with a done step's id when its summary is clicked (or null to close it). */
  onReview?: (id: string | null) => void;
  /** A button shown with a reviewed done step, by its id (workspace spec 101); none when it returns undefined. */
  reviewAction?: (id: string) => FlowReviewAction | undefined;
  /**
   * Scrolls the current step into view when it changes (and when the flow opens on a later step), and focuses its
   * first empty roll once the flow has moved on.
   */
  autoScroll?: boolean;
  orientation?: 'vertical' | 'horizontal';
}) {
  const { t } = useTranslation();
  const horizontal = orientation === 'horizontal';
  const contentRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const currentRef = useRef<HTMLLIElement>(null);
  const shownIndex = useRef<number | null>(null);

  // Spec 085, 1.2: the sticky footer covers the bottom of the scrolling area, so whatever the browser scrolls into
  // view (a focused field, the current step) keeps clear of it. Its height is also set as `--rmu-flow-footer`, so that
  // a bar of a step that sticks to the bottom (spec 085, 3.2) sits right above it.
  useLayoutEffect(() => {
    const footer = footerRef.current;
    const scroller = scrollParent(rootRef.current);
    if (!footer || !scroller) return undefined;
    const update = () => {
      scroller.style.scrollPaddingBottom = `${footer.offsetHeight + 16}px`;
      scroller.style.setProperty('--rmu-flow-footer', `${footer.offsetHeight}px`);
    };
    update();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(update);
    observer.observe(footer);
    return () => {
      observer.disconnect();
      scroller.style.scrollPaddingBottom = '';
      scroller.style.removeProperty('--rmu-flow-footer');
    };
  }, [!!footer]);

  // Spec 085, 1.3.
  useEffect(() => {
    const previous = shownIndex.current;
    shownIndex.current = activeIndex;
    if (!autoScroll || previous === activeIndex) return;
    if (horizontal) {
      // The step replaces the previous one under the bar: back to its top.
      if (previous === null) return;
      const scroller = scrollParent(rootRef.current);
      scroller?.scrollTo?.({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      if (contentRef.current) firstEmptyRoll(contentRef.current)?.focus({ preventScroll: true });
      return;
    }
    const step = currentRef.current;
    if (!step) return;
    // On opening, only a flow that is already past its first step moves.
    if (previous === null && activeIndex === 0) return;
    step.scrollIntoView?.({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    if (previous !== null) firstEmptyRoll(step)?.focus({ preventScroll: true });
  }, [activeIndex, autoScroll, horizontal]);

  if (horizontal) {
    const reviewIndex = reviewing ? steps.findIndex((step) => step.id === reviewing) : -1;
    const shown = reviewIndex >= 0 && reviewIndex < activeIndex ? steps[reviewIndex] : steps[activeIndex];
    const isReview = !!shown && shown !== steps[activeIndex];
    return (
      <Box ref={rootRef} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Box
          component="ol"
          sx={{
            listStyle: 'none',
            m: 0,
            px: { xs: 1, sm: 3 },
            py: 1,
            display: 'flex',
            alignItems: 'flex-start',
            gap: { xs: 0.5, sm: 1 },
            position: 'sticky',
            top: 0,
            zIndex: 3,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {steps.map((step, index) => {
            const state = stepState(index, activeIndex);
            const selected = step === shown;
            const body = (
              <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
                <StepBadge index={index} state={state} />
                <Box
                  sx={{
                    minWidth: 0,
                    // On phones only the current step (or the reviewed one) keeps its name.
                    display: { xs: selected ? 'block' : 'none', md: 'block' },
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    noWrap
                    sx={{ fontWeight: state === 'current' ? 700 : 600, lineHeight: '24px' }}
                    color={state === 'next' ? 'text.disabled' : 'text.primary'}
                  >
                    {step.label}
                  </Typography>
                  {state === 'done' && step.summary && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="div"
                      noWrap
                      sx={{ display: { xs: 'none', md: 'block' } }}
                    >
                      {step.summary}
                    </Typography>
                  )}
                </Box>
              </Stack>
            );
            return (
              <Box
                component="li"
                key={step.id}
                aria-current={state === 'current' ? 'step' : undefined}
                sx={{
                  minWidth: 0,
                  flex: { xs: selected ? '1 1 auto' : '0 0 auto', md: '1 1 0' },
                  borderBottom: 2,
                  borderColor: selected ? 'primary.main' : 'transparent',
                  pb: 0.5,
                }}
              >
                {state === 'done' && onReview ? (
                  <ButtonBase
                    onClick={() => onReview(reviewing === step.id ? null : step.id)}
                    aria-pressed={selected}
                    aria-label={step.label}
                    sx={{
                      width: '100%',
                      justifyContent: 'flex-start',
                      borderRadius: 1,
                      p: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    {body}
                  </ButtonBase>
                ) : (
                  <Box sx={{ p: 0.5 }}>{body}</Box>
                )}
              </Box>
            );
          })}
        </Box>
        <Box ref={contentRef} sx={{ flex: 1, px: { xs: 1.5, sm: 3 }, py: 2 }}>
          {isReview && onReview && (
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
              <ButtonBase
                onClick={() => onReview(null)}
                sx={{ px: 1, py: 0.5, borderRadius: 1, color: 'primary.main', typography: 'body2' }}
              >
                {t('flow-back-to-step', { step: steps[activeIndex]?.label ?? '' })}
              </ButtonBase>
              {(() => {
                const action = reviewAction?.(shown.id);
                return action ? <ReviewActionButton action={action} /> : null;
              })()}
            </Stack>
          )}
          {shown?.content && (
            <Box key={shown.id} sx={enterSx()}>
              {isReview && !shown.reviewInteractive ? (
                <Box inert sx={{ opacity: 0.85 }}>
                  {shown.content}
                </Box>
              ) : (
                shown.content
              )}
            </Box>
          )}
        </Box>
        {footer && (
          <Box
            ref={footerRef}
            sx={{
              position: 'sticky',
              bottom: 0,
              px: { xs: 1.5, sm: 3 },
              py: 1.5,
              bgcolor: 'background.paper',
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            {footer}
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box ref={rootRef} sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stack component="ol" sx={{ listStyle: 'none', m: 0, p: 2, gap: 1, flex: 1 }}>
        {steps.map((step, index) => {
          const state = stepState(index, activeIndex);
          const open = state === 'current' || (state === 'done' && reviewing === step.id);
          const header = (
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', width: '100%', textAlign: 'left' }}>
              <StepBadge index={index} state={state} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: state === 'current' ? 700 : 600 }}
                  color={state === 'next' ? 'text.disabled' : 'text.primary'}
                >
                  {step.label}
                </Typography>
                {state === 'done' && step.summary && (
                  <Typography variant="caption" color="text.secondary" component="div" noWrap>
                    {step.summary}
                  </Typography>
                )}
              </Box>
            </Stack>
          );
          return (
            <Box
              component="li"
              key={step.id}
              ref={state === 'current' ? currentRef : undefined}
              aria-current={state === 'current' ? 'step' : undefined}
              sx={{ scrollMarginTop: 8 }}
            >
              {state === 'done' && onReview ? (
                <ButtonBase
                  onClick={() => onReview(reviewing === step.id ? null : step.id)}
                  aria-expanded={open}
                  sx={{ width: '100%', borderRadius: 1, p: 0.5, '&:hover': { bgcolor: 'action.hover' } }}
                >
                  {header}
                </ButtonBase>
              ) : (
                <Box sx={{ p: 0.5 }}>{header}</Box>
              )}
              {open && step.content && (
                <Box sx={[{ pl: 5, pt: 1, pb: 1 }, enterSx()]}>
                  {state === 'done' &&
                    (() => {
                      const action = reviewAction?.(step.id);
                      return action ? (
                        <Box sx={{ mb: 1 }}>
                          <ReviewActionButton action={action} />
                        </Box>
                      ) : null;
                    })()}
                  {state === 'done' && !step.reviewInteractive ? (
                    <Box inert sx={{ opacity: 0.85 }}>
                      {step.content}
                    </Box>
                  ) : (
                    step.content
                  )}
                </Box>
              )}
            </Box>
          );
        })}
      </Stack>
      {footer && (
        <Box
          ref={footerRef}
          sx={{
            position: 'sticky',
            bottom: 0,
            px: 2,
            py: 1.5,
            bgcolor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          {footer}
        </Box>
      )}
    </Box>
  );
}
