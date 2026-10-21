import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Stack, Tooltip } from '@mui/material';
import { combatColors } from './actionTypes';

/** Action phases of a round: one base action point each. */
const PHASES = 4;

/** An entry of the AP ledger of an actor round, as rmu-api-tactical returns it (spec 011, §2). */
export type ApLedgerItem = {
  phase: number;
  ap: number;
  kind: 'spent' | 'lost' | 'instant' | string;
  actionId?: string;
};

/** State of one action point of a phase. */
export type ApPipState = 'spent' | 'available' | 'lost';

/** One action point of a phase: `bonus` when it is over the base AP of the phase (haste, speed...). */
export type ApPip = { state: ApPipState; bonus: boolean };

/**
 * Action points of each phase (index 0 is phase 1) from the capacity and the ledger of an actor round:
 * - a phase has 1 base AP; capacity over it is shown as bonus points, and a phase with no capacity shows its base
 *   AP as lost (surprise, staggered, Hold Kind...);
 * - the AP used in the phase (spent, and instantaneous actions past the first one) are spent, base points first;
 * - an AP recorded as lost in the ledger (an open action that found no capacity) is lost too, unless the missing
 *   capacity already shows it.
 */
export const apPhasePips = (capacity: number[], ledger: ApLedgerItem[] = []): ApPip[][] =>
  Array.from({ length: PHASES }, (_, index) => {
    const phase = index + 1;
    const available = Math.max(0, capacity[index] ?? 1);
    const entries = ledger.filter((entry) => entry.phase === phase);
    const used = entries.filter((entry) => entry.kind !== 'lost').reduce((sum, entry) => sum + entry.ap, 0);
    const lostInLedger = entries.filter((entry) => entry.kind === 'lost').reduce((sum, entry) => sum + entry.ap, 0);
    const lost = Math.max(available === 0 ? 1 : 0, lostInLedger);
    const pips: ApPip[] = [];
    for (let i = 0; i < available; i++) pips.push({ state: i < used ? 'spent' : 'available', bonus: i > 0 });
    for (let i = 0; i < lost; i++) pips.push({ state: 'lost', bonus: false });
    return pips;
  });

const Pip: FC<{ pip: ApPip; past: boolean }> = ({ pip, past }) => (
  <Box
    data-state={pip.state}
    data-bonus={pip.bonus || undefined}
    sx={(theme) => {
      const colors = combatColors(theme);
      const color = pip.bonus ? colors.optimal : theme.palette.text.secondary;
      const base = {
        position: 'relative' as const,
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
      };
      if (pip.state === 'lost')
        return {
          ...base,
          border: `1.5px solid ${theme.palette.error.main}`,
          opacity: 0.8,
          // Struck through: a lost point is never told by its color alone.
          '&::after': {
            content: '""',
            position: 'absolute',
            left: -2,
            right: -2,
            top: '50%',
            borderTop: `1.5px solid ${theme.palette.error.main}`,
            transform: 'rotate(-45deg)',
          },
        };
      if (pip.state === 'spent') return { ...base, bgcolor: color, border: `1.5px solid ${color}` };
      // An available point of a phase already over was not used: it is dimmed.
      return { ...base, border: `1.5px solid ${color}`, opacity: past ? 0.4 : 1 };
    }}
  />
);

/**
 * Action points of an actor round by phase: one cell per phase (laid out as a 4-column grid, so it lines up with
 * the phase columns of the board), with a point per AP of capacity, filled when spent, hollow when available, struck
 * through when lost, and in the `optimal` color when it is a bonus AP. Each phase names its points in a tooltip.
 */
const ApPips: FC<{
  /** AP of each phase, index 0 is phase 1. */
  capacity: number[];
  ledger?: ApLedgerItem[];
  /** Current action phase (1-4): the available points of earlier phases are dimmed. 0 or missing: none. */
  currentPhase?: number;
  /** CSS grid columns; by default the 4 phases share the width. */
  columns?: string;
}> = ({ capacity, ledger = [], currentPhase = 0, columns = `repeat(${PHASES}, minmax(0, 1fr))` }) => {
  const { t } = useTranslation();
  const phases = apPhasePips(capacity, ledger);
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: columns, columnGap: '6px' }}>
      {phases.map((pips, index) => {
        const phase = index + 1;
        const count = (state: ApPipState) => pips.filter((pip) => pip.state === state).length;
        const label = t('ap-pips-phase', {
          phase,
          spent: count('spent'),
          capacity: pips.filter((pip) => pip.state !== 'lost').length,
          lost: count('lost'),
        });
        const bonus = pips.filter((pip) => pip.bonus).length;
        return (
          <Tooltip key={phase} title={bonus > 0 ? `${label} · ${t('ap-pips-bonus', { count: bonus })}` : label}>
            <Stack
              direction="row"
              role="img"
              aria-label={label}
              sx={{ gap: 0.5, alignItems: 'center', justifyContent: 'center', minHeight: 14, flexWrap: 'wrap' }}
            >
              {pips.map((pip, i) => (
                <Pip key={i} pip={pip} past={currentPhase > 0 && phase < currentPhase} />
              ))}
            </Stack>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ApPips;
