import React, { FC, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  MAGIC_BONUS_KINDS,
  MAGIC_ITEM_KINDS,
  MAGIC_SPELL_USES,
  MAGIC_STANDARD_MATERIALS,
  MAGIC_STANDARD_TABLES,
  MagicBonusKind,
  MagicItemKind,
  MagicItemQuote,
  MagicItemRequest,
  MagicSpellUse,
  MagicStandardTable,
} from '../../api/magic-item.dto';
import type { ItemHolder, StrategicItem } from '../../api/strategic-item.dto';
import { createMagicItem, quoteMagicItem } from '../../api/treasure.api';
import { itemCategoryImage } from '../../config/default-images';
import { isApiError } from '../../data/api-error';
import { useDebounce } from '../../data/useDebounce';
import RmuDialog from '../../dialogs/RmuDialog';
import { KeyValueList } from '../../display/KeyValuePanel';
import NumberPadField from '../../inputs/NumberPadField';
import Panel from '../../layouts/Panel';
import SectionLabel from '../../layouts/SectionLabel';
import EntityPicker from '../../selectors/EntityPicker';
import { EnumPicker } from '../../selectors/pickers';
import EmptyState from '../../ui/states/EmptyState';
import LoadingState from '../../ui/states/LoadingState';
import { useItemCatalog } from '../item/ItemCatalogBrowser';
import type { ItemFeatureTranslate } from '../item/ItemFeatureChips';
import MoneyDisplay from '../item/MoneyDisplay';

export type MagicItemDialogProps = {
  open: boolean;
  onClose: () => void;
  gameId: string;
  /** Who gets the item. */
  holder: ItemHolder;
  onCreated: (item: StrategicItem) => void;
  /** The base item chosen at the start. */
  baseItemTypeId?: string | null;
  /** Shows the switch that charges the price to the holder; without it the item is a gift. */
  allowPayment?: boolean;
};

type BonusRow = { kind: MagicBonusKind; value: number | null; target: string; against: string };
type SpellRow = { name: string; level: number | null; list: string; use: MagicSpellUse; perDay: number | null };

const QUOTE_DELAY = 500;

const errorText = (error: unknown, t: ItemFeatureTranslate): string =>
  isApiError(error) ? t(error.messageKey) : error instanceof Error ? error.message : String(error);

const orNull = (value: string): string | null => (value.trim() ? value.trim() : null);

/** The request of the form: rows without a value or a name are left out. */
export const buildMagicItemRequest = (form: {
  baseItemTypeId: string;
  name: string;
  kind: MagicItemKind;
  itemLevel: number | null;
  bonuses: BonusRow[];
  spells: SpellRow[];
  charges: number | null;
  attunement: boolean;
  price: number | null;
  standardTable: MagicStandardTable | null;
  standardBonus: number | null;
  material: string | null;
}): MagicItemRequest => ({
  baseItemTypeId: form.baseItemTypeId,
  name: orNull(form.name),
  kind: form.kind,
  itemLevel: form.itemLevel,
  bonuses: form.bonuses
    .filter((bonus) => bonus.value !== null)
    .map((bonus) => ({
      kind: bonus.kind,
      value: bonus.value as number,
      target: orNull(bonus.target),
      against: orNull(bonus.against),
    })),
  spells: form.spells
    .filter((spell) => spell.name.trim() && spell.level !== null)
    .map((spell) => ({
      name: spell.name.trim(),
      level: spell.level as number,
      list: orNull(spell.list),
      use: spell.use,
      perDay: spell.use === 'daily' ? spell.perDay : null,
    })),
  charges: form.charges,
  attunement: form.attunement,
  price: form.price,
  standard:
    form.standardTable && form.standardBonus !== null
      ? {
          table: form.standardTable,
          bonus: form.standardBonus,
          ...(form.standardTable === 'general-bonus' && form.material ? { material: form.material } : {}),
        }
      : null,
});

const MagicItemForm: FC<Omit<MagicItemDialogProps, 'open'>> = ({
  onClose,
  gameId,
  holder,
  onCreated,
  baseItemTypeId: initialBase,
  allowPayment = false,
}) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { items } = useItemCatalog();
  const [baseItemTypeId, setBaseItemTypeId] = useState<string | null>(initialBase ?? null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<MagicItemKind>('weapon');
  const [itemLevel, setItemLevel] = useState<number | null>(null);
  const [bonuses, setBonuses] = useState<BonusRow[]>([]);
  const [spells, setSpells] = useState<SpellRow[]>([]);
  const [charges, setCharges] = useState<number | null>(null);
  const [attunement, setAttunement] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [standardTable, setStandardTable] = useState<MagicStandardTable | null>(null);
  const [standardBonus, setStandardBonus] = useState<number | null>(null);
  const [material, setMaterial] = useState<string | null>(null);
  const [pay, setPay] = useState(false);
  const [quote, setQuote] = useState<MagicItemQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const request = useMemo(
    () =>
      baseItemTypeId
        ? buildMagicItemRequest({
            baseItemTypeId,
            name,
            kind,
            itemLevel,
            bonuses,
            spells,
            charges,
            attunement,
            price,
            standardTable,
            standardBonus,
            material,
          })
        : null,
    [
      baseItemTypeId,
      name,
      kind,
      itemLevel,
      bonuses,
      spells,
      charges,
      attunement,
      price,
      standardTable,
      standardBonus,
      material,
    ]
  );
  const quoteKey = useDebounce(request ? JSON.stringify(request) : '', QUOTE_DELAY);

  useEffect(() => {
    if (!quoteKey) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    quoteMagicItem(JSON.parse(quoteKey) as MagicItemRequest, auth)
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
        setError(null);
      })
      .catch((err) => !cancelled && setError(errorText(err, t)))
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteKey]);

  const options = useMemo(
    () =>
      items?.map((item) => ({
        id: item.id,
        label: t(item.name, { defaultValue: item.name }),
        imageUrl: item.imageUrl || itemCategoryImage(item.category),
        group: t(`item-category-${item.category}`, { defaultValue: item.category }),
        entity: item,
      })),
    [items, t]
  );

  const create = () => {
    if (!request) return;
    setCreating(true);
    setError(null);
    createMagicItem(
      {
        ...request,
        gameId,
        ...(holder.kind === 'faction' ? { factionId: holder.id } : { characterId: holder.id }),
        payer: allowPayment && pay ? holder : 'none',
      },
      auth
    )
      .then((item) => {
        onCreated(item);
        onClose();
      })
      .catch((err) => setError(errorText(err, t)))
      .finally(() => setCreating(false));
  };

  const updateBonus = (index: number, patch: Partial<BonusRow>) =>
    setBonuses((rows) => rows.map((row, each) => (each === index ? { ...row, ...patch } : row)));
  const updateSpell = (index: number, patch: Partial<SpellRow>) =>
    setSpells((rows) => rows.map((row, each) => (each === index ? { ...row, ...patch } : row)));
  const newBonus: BonusRow = { kind: 'ob', value: null, target: '', against: '' };
  const newSpell: SpellRow = { name: '', level: null, list: '', use: 'daily', perDay: 1 };

  return (
    <RmuDialog
      open
      title={t('magic-item-create')}
      maxWidth="md"
      onCancel={onClose}
      buttons={
        <Button variant="contained" onClick={create} disabled={!request || creating}>
          {t('create')}
        </Button>
      }
    >
      <Stack spacing={2}>
        <Panel variant="outlined" dense title={t('magic-base-item')}>
          <Stack spacing={1.5}>
            <EntityPicker
              variant="select"
              kind="item"
              required
              label={t('magic-base-item')}
              options={options}
              value={baseItemTypeId}
              onChange={(id) => setBaseItemTypeId(id)}
            />
            <TextField
              label={t('name')}
              helperText={t('magic-item-name-hint')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <Box sx={{ flex: 2 }}>
                <EnumPicker
                  variant="select"
                  required
                  label={t('magic-kind')}
                  values={MAGIC_ITEM_KINDS}
                  labelPrefix="magic-kind-"
                  value={kind}
                  onChange={(id) => id && setKind(id as MagicItemKind)}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <NumberPadField
                  label={t('enchantment-item-level')}
                  helperText={t('magic-item-level-auto')}
                  value={itemLevel}
                  onChange={setItemLevel}
                  integer
                  allowNegatives={false}
                  min={0}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <NumberPadField
                  label={t('magic-charges')}
                  value={charges}
                  onChange={setCharges}
                  integer
                  allowNegatives={false}
                  min={0}
                />
              </Box>
            </Stack>
            <FormControlLabel
              control={<Switch checked={attunement} onChange={(event) => setAttunement(event.target.checked)} />}
              label={t('attunement')}
            />
          </Stack>
        </Panel>

        <Panel variant="outlined" dense title={t('magic-standard-table')}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Box sx={{ flex: 2 }}>
              <EnumPicker
                variant="select"
                label={t('magic-standard-table')}
                values={MAGIC_STANDARD_TABLES}
                labelPrefix="magic-standard-table-"
                allowAll
                allLabel={t('magic-standard-none')}
                value={standardTable}
                onChange={(id) => setStandardTable(id as MagicStandardTable | null)}
              />
            </Box>
            {standardTable && (
              <Box sx={{ flex: 1 }}>
                <NumberPadField label={t('bonus')} value={standardBonus} onChange={setStandardBonus} integer signed />
              </Box>
            )}
            {standardTable === 'general-bonus' && (
              <Box sx={{ flex: 1 }}>
                <EnumPicker
                  variant="select"
                  label={t('material')}
                  values={MAGIC_STANDARD_MATERIALS}
                  formatLabel={(value) => t(value)}
                  value={material}
                  onChange={(id) => setMaterial(id)}
                />
              </Box>
            )}
          </Stack>
        </Panel>

        <Panel
          variant="outlined"
          dense
          title={t('magic-bonuses')}
          extra={
            <Button size="small" startIcon={<AddIcon />} onClick={() => setBonuses((rows) => [...rows, newBonus])}>
              {t('add')}
            </Button>
          }
        >
          {bonuses.length === 0 && <EmptyState dense title={t('magic-no-bonuses')} />}
          <Stack spacing={1.5}>
            {bonuses.map((bonus, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center' }}>
                <Box sx={{ flex: 2, width: '100%' }}>
                  <EnumPicker
                    variant="select"
                    required
                    label={t('magic-bonus')}
                    values={MAGIC_BONUS_KINDS}
                    labelPrefix="magic-bonus-"
                    value={bonus.kind}
                    onChange={(id) => id && updateBonus(index, { kind: id as MagicBonusKind })}
                  />
                </Box>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <NumberPadField
                    label={t('value')}
                    value={bonus.value}
                    onChange={(value) => updateBonus(index, { value })}
                    signed
                  />
                </Box>
                <TextField
                  sx={{ flex: 2 }}
                  fullWidth
                  label={t('target')}
                  value={bonus.target}
                  onChange={(event) => updateBonus(index, { target: event.target.value })}
                />
                <TextField
                  sx={{ flex: 2 }}
                  fullWidth
                  label={t('magic-against')}
                  value={bonus.against}
                  onChange={(event) => updateBonus(index, { against: event.target.value })}
                />
                <Tooltip title={t('remove')}>
                  <IconButton
                    aria-label={t('remove')}
                    onClick={() => setBonuses((rows) => rows.filter((_, each) => each !== index))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Panel>

        <Panel
          variant="outlined"
          dense
          title={t('enchantment-spells')}
          extra={
            <Button size="small" startIcon={<AddIcon />} onClick={() => setSpells((rows) => [...rows, newSpell])}>
              {t('add')}
            </Button>
          }
        >
          {spells.length === 0 && <EmptyState dense title={t('magic-no-spells')} />}
          <Stack spacing={1.5}>
            {spells.map((spell, index) => (
              <Stack key={index} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: 'center' }}>
                <TextField
                  sx={{ flex: 3 }}
                  fullWidth
                  label={t('spell')}
                  value={spell.name}
                  onChange={(event) => updateSpell(index, { name: event.target.value })}
                />
                <Box sx={{ flex: 1, width: '100%' }}>
                  <NumberPadField
                    label={t('level')}
                    value={spell.level}
                    onChange={(level) => updateSpell(index, { level })}
                    integer
                    allowNegatives={false}
                    min={0}
                  />
                </Box>
                <TextField
                  sx={{ flex: 2 }}
                  fullWidth
                  label={t('spell-list')}
                  value={spell.list}
                  onChange={(event) => updateSpell(index, { list: event.target.value })}
                />
                <Box sx={{ flex: 2, width: '100%' }}>
                  <EnumPicker
                    variant="select"
                    required
                    label={t('use')}
                    values={MAGIC_SPELL_USES}
                    labelPrefix="magic-spell-use-"
                    value={spell.use}
                    onChange={(id) => id && updateSpell(index, { use: id as MagicSpellUse })}
                  />
                </Box>
                {spell.use === 'daily' && (
                  <Box sx={{ flex: 1, width: '100%' }}>
                    <NumberPadField
                      label={t('magic-per-day')}
                      value={spell.perDay}
                      onChange={(perDay) => updateSpell(index, { perDay })}
                      integer
                      allowNegatives={false}
                      min={1}
                    />
                  </Box>
                )}
                <Tooltip title={t('remove')}>
                  <IconButton
                    aria-label={t('remove')}
                    onClick={() => setSpells((rows) => rows.filter((_, each) => each !== index))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        </Panel>

        <Panel variant="outlined" dense title={t('magic-quote')}>
          <Stack spacing={1.5}>
            {!request && <EmptyState dense title={t('magic-choose-base')} />}
            {request && quoting && !quote && <LoadingState variant="inline" />}
            {quote && (
              <KeyValueList
                dense
                rows={[
                  { label: t('days'), value: quote.days },
                  { label: t('enchantment-item-level'), value: quote.itemLevel },
                  { label: t('magic-price'), value: <MoneyDisplay gold={quote.price} /> },
                ]}
              />
            )}
            {quote && quote.breakdown.length > 0 && (
              <Stack spacing={0.25}>
                <SectionLabel>{t('magic-breakdown')}</SectionLabel>
                {quote.breakdown.map((line, index) => (
                  <Typography key={index} variant="caption" color="text.secondary">
                    {t(line, { defaultValue: line })}
                  </Typography>
                ))}
              </Stack>
            )}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
              <Box sx={{ flex: 1 }}>
                <NumberPadField
                  label={t('magic-manual-price')}
                  helperText={t('magic-manual-price-hint')}
                  value={price}
                  onChange={setPrice}
                  allowNegatives={false}
                  min={0}
                  suffix={t('coin-gp')}
                />
              </Box>
              {allowPayment && (
                <FormControlLabel
                  sx={{ flex: 1 }}
                  control={<Switch checked={pay} onChange={(event) => setPay(event.target.checked)} />}
                  label={t('magic-charge-holder')}
                />
              )}
            </Stack>
          </Stack>
        </Panel>

        {error && <Alert severity="error">{error}</Alert>}
      </Stack>
    </RmuDialog>
  );
};

/**
 * Creates a magic item (spec 067): a base item of the catalog with a kind, level, bonuses, spells, charges and
 * attunement, priced by a standard table of chapter 6 or by the formula of table 6-1a. The quote is asked to the
 * server as the form changes; the game master may set the price by hand. Requires an auth provider.
 */
const MagicItemDialog: FC<MagicItemDialogProps> = ({ open, ...props }) => (open ? <MagicItemForm {...props} /> : null);

export default MagicItemDialog;
