import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ItemHolder } from '../../api/strategic-item.dto';
import { TREASURE_QUALITIES, TreasureQuality } from '../../api/treasure-tables.dto';
import { awardTreasure } from '../../api/treasure.api';
import {
  isAwardableTreasureLine,
  TreasureAwardResult,
  TreasureDie,
  TreasureLine,
  TreasurePendingRoll,
  TreasureRollRequest,
} from '../../api/treasure.dto';
import { isApiError } from '../../data/api-error';
import ChipRow from '../../display/ChipRow';
import NumberPadField from '../../inputs/NumberPadField';
import Panel from '../../layouts/Panel';
import SectionLabel from '../../layouts/SectionLabel';
import { EnumPicker } from '../../selectors/pickers';
import RollField from '../../rolls/RollField';
import { D10, D100 } from '../../rolls/presets';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/states/EmptyState';
import LoadingState from '../../ui/states/LoadingState';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';
import MoneyDisplay from '../item/MoneyDisplay';
import { magicItemSummary } from '../magic/magic-format';
import { randomInRange, useTreasureRollFlow } from './useTreasureRollFlow';

/** A table to show: a die of the treasure, with its roll once known. */
export type TreasureTableFocus = { table: string; roll: number | null; modifier: number };

export type TreasureRollPanelProps = {
  /** The treasure codes of the book ("c, n, x"), editable. */
  codes?: string | null;
  /** The game: its power level for the roll, and the game of the award. */
  gameId?: string | null;
  /** Who gets the treasure; Award stays disabled until there is one. */
  holder?: ItemHolder | null;
  /** A picker of the game and the holder, shown above the award (npcs). */
  holderPicker?: ReactNode;
  onAwarded?: (result: TreasureAwardResult) => void;
  /** The treasure is only looked at: no way of awarding it. */
  readOnly?: boolean;
  /** Links each die to its table, and follows the die being rolled. */
  onTableFocus?: (focus: TreasureTableFocus) => void;
  /** Whether a die reads a table that can be shown: a price or a pick does not. All of them by default. */
  hasTable?: (table: string) => boolean;
};

type QualityKind = 'wealth' | 'lifestyle' | 'magic';
const QUALITY_KINDS: QualityKind[] = ['wealth', 'lifestyle', 'magic'];
type Qualities = Record<QualityKind, TreasureQuality[]>;
const NO_QUALITIES: Qualities = { wealth: [], lifestyle: [], magic: [] };

const errorText = (error: unknown, t: ItemFeatureTranslate): string =>
  isApiError(error) ? t(error.messageKey) : error instanceof Error ? error.message : String(error);

/** A key, a key with a detail (`treasure-lifestyle: rich +15 / max +10`) or plain text from the API. */
const text = (value: string, t: ItemFeatureTranslate) => {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)+): (.*)$/.exec(value);
  if (match) return `${t(match[1], { defaultValue: match[1] })}: ${match[2]}`;
  return t(value, { defaultValue: value });
};

/** The name of the table of a die; a die that reads no table (a price, a pick) has a name too. */
const tableName = (table: string, t: ItemFeatureTranslate) => t(`treasure-table-${table}`, { defaultValue: table });

/** The rolls behind a line. */
const TreasureDice: FC<{
  dice: TreasureDie[];
  onTableFocus?: (focus: TreasureTableFocus) => void;
  hasTable?: (table: string) => boolean;
}> = ({ dice, onTableFocus, hasTable }) => {
  const { t } = useTranslation();
  return (
    <DataTable<TreasureDie>
      rows={dice}
      getKey={(die) => `${die.table}-${die.roll}-${die.result}`}
      columns={[
        {
          key: 'table',
          header: t('table'),
          render: (die) =>
            onTableFocus && (hasTable?.(die.table) ?? true) ? (
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => onTableFocus({ table: die.table, roll: die.roll, modifier: die.modifier })}
              >
                {tableName(die.table, t)}
              </Link>
            ) : (
              tableName(die.table, t)
            ),
        },
        { key: 'roll', header: t('roll'), align: 'right', render: (die) => die.roll },
        { key: 'modifier', header: t('modifier'), align: 'right', render: (die) => die.modifier },
        { key: 'total', header: t('total'), align: 'right', render: (die) => die.total },
        { key: 'result', header: t('result'), render: (die) => text(die.result, t) },
      ]}
    />
  );
};

/** The content of a line: gold, an item (value, carats, class, magic) or a note. */
const TreasureLineContent: FC<{ line: TreasureLine }> = ({ line }) => {
  const { t } = useTranslation();
  if (line.kind === 'gold') return <MoneyDisplay gold={line.gold} showIcon />;
  if (line.kind === 'note')
    return (
      <Typography variant="body2" color="text.secondary">
        {text(line.text, t)}
      </Typography>
    );
  return (
    <Stack spacing={0.5} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {text(line.name, t)}
          {line.amount && line.amount > 1 ? ` ×${line.amount}` : ''}
        </Typography>
        <MoneyDisplay gold={line.value} />
      </Stack>
      <ChipRow>
        {line.carats ? <Chip size="small" label={t('gem-carats-value', { count: line.carats })} /> : null}
        {line.jewelryClass ? <Chip size="small" label={t(`jewelry-class-${line.jewelryClass}`)} /> : null}
        {line.magic ? (
          <Chip size="small" color="primary" variant="outlined" label={magicItemSummary(line.magic, t)} />
        ) : null}
      </ChipRow>
    </Stack>
  );
};

/** The explicit qualities of one kind of code: repeated values are rolled twice. */
const QualityList: FC<{
  kind: QualityKind;
  values: TreasureQuality[];
  onChange: (values: TreasureQuality[]) => void;
}> = ({ kind, values, onChange }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={0.75}>
      <EnumPicker
        variant="select"
        label={t(`treasure-${kind}`)}
        values={TREASURE_QUALITIES}
        labelPrefix="treasure-quality-"
        value={null}
        onChange={(id) => id && onChange([...values, id as TreasureQuality])}
      />
      {values.length > 0 && (
        <ChipRow>
          {values.map((quality, index) => (
            <Chip
              key={index}
              size="small"
              label={t(`treasure-quality-${quality}`)}
              onDelete={() => onChange(values.filter((_, each) => each !== index))}
            />
          ))}
        </ChipRow>
      )}
    </Stack>
  );
};

/** The input of the die being rolled: the roll field for dice, a number with its random button for other ranges. */
const PendingDieField: FC<{ die: TreasurePendingRoll; disabled: boolean; onEnter: (value: number) => void }> = ({
  die,
  disabled,
  onEnter,
}) => {
  const { t } = useTranslation();
  const [value, setValue] = useState<number | null>(null);
  const spec = die.min === 1 && die.max === 100 ? D100 : die.min === 1 && die.max === 10 ? D10 : null;
  if (spec) return <RollField spec={spec} value={null} onChange={(roll) => onEnter(roll.total)} disabled={disabled} />;
  const valid = value !== null && value >= die.min && value <= die.max;
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <NumberPadField label={t('roll')} value={value} onChange={setValue} integer min={die.min} max={die.max} />
      <Tooltip title={t('treasure-random-value')}>
        <span>
          <IconButton
            aria-label={t('treasure-random-value')}
            disabled={disabled}
            onClick={() => onEnter(randomInRange(die.min, die.max))}
          >
            <CasinoOutlinedIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Button disabled={disabled || !valid} onClick={() => valid && onEnter(value)}>
        {t('accept')}
      </Button>
    </Stack>
  );
};

/**
 * Random treasure of Treasure Law 7.1 (specs 067 and 094): the codes of the book (or explicit qualities) and a wealth
 * modifier. The dice are rolled in the browser, all at once or one by one, and the API works out the treasure from
 * them; each line shows its value and its dice, and the chosen ones are awarded to the holder. Requires an auth
 * provider.
 */
const TreasureRollPanel: FC<TreasureRollPanelProps> = ({ codes, gameId, holder, holderPicker, onAwarded, readOnly = false, onTableFocus, hasTable }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const flow = useTreasureRollFlow();
  const [codesText, setCodesText] = useState(codes ?? '');
  const [qualities, setQualities] = useState<Qualities>(NO_QUALITIES);
  const [modifier, setModifier] = useState<number | null>(0);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [awarding, setAwarding] = useState(false);
  const [awardError, setAwardError] = useState<unknown>(null);
  const { pending, result: roll, busy: rolling } = flow;
  const busy = rolling || awarding;
  const canReceive = !readOnly;

  useEffect(() => {
    setSelected(
      new Set(roll ? roll.lines.flatMap((line, index) => (isAwardableTreasureLine(line) ? [index] : [])) : [])
    );
    setExpanded(new Set());
  }, [roll]);

  useEffect(() => {
    if (pending) onTableFocus?.({ table: pending.table, roll: null, modifier: pending.modifier });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const hasInput = codesText.trim() !== '' || QUALITY_KINDS.some((kind) => qualities[kind].length > 0);

  const doRoll = (auto: boolean) => {
    const request: TreasureRollRequest = {
      codes: codesText.trim() || null,
      ...QUALITY_KINDS.reduce(
        (acc, kind) => (qualities[kind].length > 0 ? { ...acc, [kind]: qualities[kind] } : acc),
        {} as Partial<Qualities>
      ),
      wealthModifier: modifier ?? 0,
      gameId: gameId ?? null,
    };
    setAwardError(null);
    void flow.start(request, auto);
  };

  const chosen = roll ? roll.lines.filter((line, index) => selected.has(index) && isAwardableTreasureLine(line)) : [];

  const doAward = () => {
    if (!holder || !gameId || chosen.length === 0) return;
    setAwarding(true);
    setAwardError(null);
    awardTreasure({ gameId, holder, lines: chosen }, auth)
      .then((result) => {
        flow.reset();
        onAwarded?.(result);
      })
      .catch(setAwardError)
      .finally(() => setAwarding(false));
  };

  const toggle = (set: Set<number>, index: number) => {
    const next = new Set(set);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    return next;
  };

  const awardable = roll ? roll.lines.filter(isAwardableTreasureLine).length : 0;
  const allSelected = awardable > 0 && chosen.length === awardable;
  const selectAll = () =>
    setSelected(
      allSelected
        ? new Set()
        : new Set(roll!.lines.flatMap((line, index) => (isAwardableTreasureLine(line) ? [index] : [])))
    );
  const selectedGold = chosen.reduce(
    (sum, line) =>
      sum + (line.kind === 'gold' ? line.gold : line.kind === 'item' ? line.value * (line.amount || 1) : 0),
    0
  );
  const canAward = !!holder && !!gameId && chosen.length > 0 && !busy;
  const error = flow.error ?? awardError;
  const inProgress = pending !== null;

  return (
    <Stack spacing={2}>
      <Panel variant="outlined" dense title={t('treasure-codes')}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              label={t('treasure-codes')}
              helperText={t('treasure-codes-hint')}
              value={codesText}
              onChange={(event) => setCodesText(event.target.value)}
              disabled={inProgress}
              fullWidth
            />
            <Box sx={{ minWidth: { sm: 180 } }}>
              <NumberPadField
                label={t('treasure-wealth-modifier')}
                helperText={t('treasure-wealth-modifier-hint')}
                value={modifier}
                onChange={setModifier}
                disabled={inProgress}
                integer
                signed
              />
            </Box>
          </Stack>
          <SectionLabel>{t('treasure-qualities')}</SectionLabel>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            {QUALITY_KINDS.map((kind) => (
              <Box key={kind} sx={{ flex: 1, minWidth: 0 }}>
                <QualityList
                  kind={kind}
                  values={qualities[kind]}
                  onChange={(values) => setQualities((current) => ({ ...current, [kind]: values }))}
                />
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button onClick={() => doRoll(false)} disabled={!hasInput || busy}>
              {t('treasure-enter-dice')}
            </Button>
            <Button
              variant="contained"
              onClick={() => doRoll(true)}
              disabled={!hasInput || busy}
              startIcon={<CasinoOutlinedIcon />}
            >
              {roll ? t('treasure-reroll') : t('treasure-roll-all')}
            </Button>
          </Stack>
        </Stack>
      </Panel>

      {error ? <Alert severity="error">{errorText(error, t)}</Alert> : null}

      {flow.active && (inProgress || flow.steps.length > 0) && !roll && (
        <Panel
          variant="outlined"
          dense
          title={t('treasure-die-number', { number: flow.steps.length + 1 })}
          extra={
            <Stack direction="row" spacing={1}>
              <Button size="small" startIcon={<UndoIcon />} onClick={() => void flow.undo()} disabled={busy || flow.steps.length === 0}>
                {t('treasure-undo-die')}
              </Button>
              <Button size="small" onClick={() => void flow.rollRest()} disabled={busy}>
                {t('treasure-roll-rest')}
              </Button>
              <Button size="small" onClick={flow.reset}>
                {t('cancel')}
              </Button>
            </Stack>
          }
        >
          {pending && (
            <Stack spacing={1.5}>
              <Typography variant="body2">
                {t('treasure-die-prompt', {
                  table: tableName(pending.table, t),
                  min: pending.min,
                  max: pending.max,
                })}
                {pending.modifier !== 0 ? ` (${t('modifier')} ${pending.modifier > 0 ? '+' : ''}${pending.modifier})` : ''}
              </Typography>
              <PendingDieField
                key={flow.steps.length}
                die={pending}
                disabled={busy}
                onEnter={(value) => void flow.enter(value)}
              />
            </Stack>
          )}
          {flow.steps.length > 0 && (
            <ChipRow sx={{ mt: 1.5 }}>
              {flow.steps.map((step, index) => (
                <Chip
                  key={index}
                  size="small"
                  variant="outlined"
                  label={`${tableName(step.table, t)}: ${step.value}`}
                  onClick={
                    onTableFocus && (hasTable?.(step.table) ?? true)
                      ? () => onTableFocus({ table: step.table, roll: step.value, modifier: step.modifier })
                      : undefined
                  }
                />
              ))}
            </ChipRow>
          )}
        </Panel>
      )}

      {rolling && <LoadingState variant="inline" />}

      {roll && (
        <Panel
          variant="outlined"
          dense
          title={t('treasure-result')}
          extra={
            awardable > 0 && canReceive ? (
              <Button size="small" onClick={selectAll}>
                {allSelected ? t('treasure-select-none') : t('select-all')}
              </Button>
            ) : undefined
          }
        >
          <Stack spacing={1}>
            {roll.warnings.map((warning, index) => (
              <Alert key={index} severity="warning">
                {text(warning, t)}
              </Alert>
            ))}
            {roll.lines.length === 0 && <EmptyState dense title={t('treasure-empty')} />}
            {roll.lines.map((line, index) => (
              <Box key={index} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  {canReceive &&
                    (isAwardableTreasureLine(line) ? (
                      <Checkbox
                        size="small"
                        checked={selected.has(index)}
                        onChange={() => setSelected((current) => toggle(current, index))}
                        slotProps={{ input: { 'aria-label': t('treasure-select-line') } }}
                      />
                    ) : (
                      <Box sx={{ width: 38, flexShrink: 0 }} />
                    ))}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <TreasureLineContent line={line} />
                  </Box>
                  {line.dice.length > 0 && (
                    <Tooltip title={t('treasure-dice')}>
                      <IconButton
                        size="small"
                        aria-label={t('treasure-dice')}
                        aria-expanded={expanded.has(index)}
                        onClick={() => setExpanded((current) => toggle(current, index))}
                      >
                        <CasinoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
                <Collapse in={expanded.has(index)} unmountOnExit>
                  <Box sx={{ pt: 1, pl: { sm: 5 } }}>
                    <TreasureDice dice={line.dice} onTableFocus={onTableFocus} hasTable={hasTable} />
                  </Box>
                </Collapse>
              </Box>
            ))}
            {awardable > 0 && canReceive && (
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', alignItems: 'baseline' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('treasure-selected-value')}
                </Typography>
                <MoneyDisplay gold={selectedGold} />
              </Stack>
            )}
          </Stack>
        </Panel>
      )}

      {canReceive && (holderPicker || roll) && (
        <Panel variant="outlined" dense title={t('treasure-award-to')}>
          <Stack spacing={1}>
            {holderPicker}
            {roll && (!holder || !gameId) && (
              <Typography variant="caption" color="text.secondary">
                {t('treasure-holder-required')}
              </Typography>
            )}
            {roll && (
              <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={doAward} disabled={!canAward}>
                  {t('treasure-award')}
                </Button>
              </Stack>
            )}
          </Stack>
        </Panel>
      )}
    </Stack>
  );
};

export default TreasureRollPanel;
