import React, { FC, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ItemHolder } from '../../api/strategic-item.dto';
import { TREASURE_QUALITIES, TreasureQuality } from '../../api/treasure-tables.dto';
import { awardTreasure, rollTreasure } from '../../api/treasure.api';
import {
  isAwardableTreasureLine,
  TreasureAwardResult,
  TreasureDie,
  TreasureLine,
  TreasureRoll,
  TreasureRollRequest,
} from '../../api/treasure.dto';
import { isApiError } from '../../data/api-error';
import RmuDialog from '../../dialogs/RmuDialog';
import ChipRow from '../../display/ChipRow';
import NumberPadField from '../../inputs/NumberPadField';
import Panel from '../../layouts/Panel';
import SectionLabel from '../../layouts/SectionLabel';
import { EnumPicker } from '../../selectors/pickers';
import DataTable from '../../ui/DataTable';
import EmptyState from '../../ui/states/EmptyState';
import LoadingState from '../../ui/states/LoadingState';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';
import MoneyDisplay from '../item/MoneyDisplay';
import { magicItemSummary } from '../magic/magic-format';

export type TreasureDialogProps = {
  open: boolean;
  onClose: () => void;
  /** The treasure codes of the book ("c, n, x"), editable. */
  codes?: string | null;
  /** The game: its power level for the roll, and the game of the award. */
  gameId?: string | null;
  /** Who gets the treasure; Award stays disabled until there is one. */
  holder?: ItemHolder | null;
  /** A picker of the game and the holder, shown above the actions (npcs). */
  holderPicker?: ReactNode;
  onAwarded?: (result: TreasureAwardResult) => void;
};

type QualityKind = 'wealth' | 'lifestyle' | 'magic';
const QUALITY_KINDS: QualityKind[] = ['wealth', 'lifestyle', 'magic'];
type Qualities = Record<QualityKind, TreasureQuality[]>;
const NO_QUALITIES: Qualities = { wealth: [], lifestyle: [], magic: [] };

const errorText = (error: unknown, t: ItemFeatureTranslate): string =>
  isApiError(error) ? t(error.messageKey) : error instanceof Error ? error.message : String(error);

const text = (value: string, t: ItemFeatureTranslate) => t(value, { defaultValue: value });

/** The rolls behind a line. */
const TreasureDice: FC<{ dice: TreasureDie[] }> = ({ dice }) => {
  const { t } = useTranslation();
  return (
    <DataTable<TreasureDie>
      rows={dice}
      getKey={(die) => `${die.table}-${die.roll}-${die.result}`}
      columns={[
        { key: 'table', header: t('table'), render: (die) => text(die.table, t) },
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

/**
 * Random treasure of Treasure Law 7.1 (spec 067): the codes of the book (or explicit qualities) and a wealth
 * modifier are rolled on the server; each line shows its value and its dice, and the chosen ones are awarded to the
 * holder. Requires an auth provider.
 */
const TreasureDialog: FC<TreasureDialogProps> = ({ open, onClose, codes, gameId, holder, holderPicker, onAwarded }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const [codesText, setCodesText] = useState(codes ?? '');
  const [qualities, setQualities] = useState<Qualities>(NO_QUALITIES);
  const [modifier, setModifier] = useState<number | null>(0);
  const [roll, setRoll] = useState<TreasureRoll | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [busy, setBusy] = useState<'roll' | 'award' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setCodesText(codes ?? '');
    setQualities(NO_QUALITIES);
    setModifier(0);
    setRoll(null);
    setSelected(new Set());
    setExpanded(new Set());
    setError(null);
  }, [open, codes]);

  const hasInput = codesText.trim() !== '' || QUALITY_KINDS.some((kind) => qualities[kind].length > 0);

  const doRoll = () => {
    const request: TreasureRollRequest = {
      codes: codesText.trim() || null,
      ...QUALITY_KINDS.reduce(
        (acc, kind) => (qualities[kind].length > 0 ? { ...acc, [kind]: qualities[kind] } : acc),
        {} as Partial<Qualities>
      ),
      wealthModifier: modifier ?? 0,
      gameId: gameId ?? null,
    };
    setBusy('roll');
    setError(null);
    rollTreasure(request, auth)
      .then((result) => {
        setRoll(result);
        setSelected(new Set(result.lines.flatMap((line, index) => (isAwardableTreasureLine(line) ? [index] : []))));
        setExpanded(new Set());
      })
      .catch((err) => setError(errorText(err, t)))
      .finally(() => setBusy(null));
  };

  const chosen = roll ? roll.lines.filter((line, index) => selected.has(index) && isAwardableTreasureLine(line)) : [];

  const doAward = () => {
    if (!holder || !gameId || chosen.length === 0) return;
    setBusy('award');
    setError(null);
    awardTreasure({ gameId, holder, lines: chosen }, auth)
      .then((result) => {
        onAwarded?.(result);
        onClose();
      })
      .catch((err) => setError(errorText(err, t)))
      .finally(() => setBusy(null));
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
  const canAward = !!holder && !!gameId && chosen.length > 0 && busy === null;

  return (
    <RmuDialog
      open={open}
      title={t('treasure-roll-title')}
      maxWidth="md"
      onClose={onClose}
      buttons={
        <>
          <Button onClick={doRoll} disabled={!hasInput || busy !== null} startIcon={<CasinoOutlinedIcon />}>
            {roll ? t('treasure-reroll') : t('roll')}
          </Button>
          <Button variant="contained" onClick={doAward} disabled={!canAward}>
            {t('treasure-award')}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Panel variant="outlined" dense title={t('treasure-codes')}>
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField
                label={t('treasure-codes')}
                helperText={t('treasure-codes-hint')}
                value={codesText}
                onChange={(event) => setCodesText(event.target.value)}
                fullWidth
              />
              <Box sx={{ minWidth: { sm: 180 } }}>
                <NumberPadField
                  label={t('treasure-wealth-modifier')}
                  helperText={t('treasure-wealth-modifier-hint')}
                  value={modifier}
                  onChange={setModifier}
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
          </Stack>
        </Panel>

        {error && <Alert severity="error">{error}</Alert>}
        {busy === 'roll' && <LoadingState variant="inline" />}

        {roll && (
          <Panel
            variant="outlined"
            dense
            title={t('treasure-result')}
            extra={
              awardable > 0 ? (
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
                    {isAwardableTreasureLine(line) ? (
                      <Checkbox
                        size="small"
                        checked={selected.has(index)}
                        onChange={() => setSelected((current) => toggle(current, index))}
                        slotProps={{ input: { 'aria-label': t('treasure-select-line') } }}
                      />
                    ) : (
                      <Box sx={{ width: 38, flexShrink: 0 }} />
                    )}
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
                      <TreasureDice dice={line.dice} />
                    </Box>
                  </Collapse>
                </Box>
              ))}
              {awardable > 0 && (
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

        {(holderPicker || (roll && !holder)) && (
          <Panel variant="outlined" dense title={t('treasure-award-to')}>
            <Stack spacing={1}>
              {holderPicker}
              {roll && (!holder || !gameId) && (
                <Typography variant="caption" color="text.secondary">
                  {t('treasure-holder-required')}
                </Typography>
              )}
            </Stack>
          </Panel>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default TreasureDialog;
