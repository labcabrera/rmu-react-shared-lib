import React, { ReactNode } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
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

/**
 * Vertical steps of a guided flow: done steps collapse into a one-line summary, the current step is open,
 * the next ones are greyed. `footer` stays at the bottom of the scrolling panel (the step's main action).
 * `reviewing` opens a done step read-only, for example after clicking its summary.
 */
export default function FlowSteps({
  steps,
  activeIndex,
  footer,
  reviewing,
  onReview,
}: {
  steps: FlowStep[];
  /** Index of the current step; `steps.length` when the whole flow is done. */
  activeIndex: number;
  footer?: ReactNode;
  /** Id of a done step shown open, read-only. */
  reviewing?: string | null;
  /** Called with a done step's id when its summary is clicked (or null to close it). */
  onReview?: (id: string | null) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
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
            <Box component="li" key={step.id} aria-current={state === 'current' ? 'step' : undefined}>
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
