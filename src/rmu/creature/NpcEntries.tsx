import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { FACTION_NPC_MAX_COUNT } from '../../api/faction.dto';
import { Npc } from '../../api/npc.dto';
import EntityAvatar from '../../avatars/EntityAvatar';
import RmuDialog from '../../dialogs/RmuDialog';
import NumericInput from '../../inputs/NumericInput';
import { NpcPicker } from '../../selectors/pickers/NpcPicker';
import { npcImage, npcName, npcSummary } from './npc-format';

/** NPCs of one kind in a faction or a tactical game (spec 055): `count` specimens of an NPC under an alias. */
export interface NpcEntry {
  npcId: string;
  /** Alias; the specimens are named after it. */
  name: string;
  count: number;
  notes?: string | null;
}

/** Whether the count of an entry is in range (1 to 50). */
export const isValidNpcCount = (count: number | null | undefined): count is number =>
  Number.isInteger(count) && (count as number) >= 1 && (count as number) <= FACTION_NPC_MAX_COUNT;

/**
 * Adds or changes one NPC entry (spec 055): the NPC (searchable by its translated name), the alias (the translated
 * name by default), the number of specimens and, with `withNotes`, notes.
 */
export const NpcEntryDialog: FC<{
  open: boolean;
  title: string;
  /** The NPCs to choose from; `undefined` while they load. */
  npcs: Npc[] | undefined;
  /** The entry changed; a new one without it. */
  entry?: NpcEntry;
  withNotes?: boolean;
  onSave: (entry: NpcEntry) => void;
  onClose: () => void;
}> = ({ open, title, npcs, entry, withNotes = false, onSave, onClose }) => {
  const { t } = useTranslation();
  const [npcId, setNpcId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [count, setCount] = useState<number | null>(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    setNpcId(entry?.npcId ?? null);
    setName(entry?.name ?? '');
    setCount(entry?.count ?? 1);
    setNotes(entry?.notes ?? '');
  }, [open, entry]);

  const nameOf = (id: string | null) => {
    const npc = id ? npcs?.find((each) => each.id === id) : undefined;
    return npc ? npcName(npc, t) : '';
  };

  // The alias follows the NPC until the user writes one of their own.
  const chooseNpc = (id: string | null) => {
    if (!name.trim() || name === nameOf(npcId)) setName(nameOf(id));
    setNpcId(id);
  };

  const valid = !!npcId && isValidNpcCount(count);
  const save = () => {
    if (!npcId || !isValidNpcCount(count)) return;
    onSave({
      npcId,
      name: name.trim() || nameOf(npcId),
      count,
      ...(withNotes ? { notes: notes.trim() || null } : {}),
    });
  };

  return (
    <RmuDialog
      open={open}
      title={title}
      maxWidth="sm"
      onCancel={onClose}
      onClose={undefined}
      onConfirm={save}
      onConfirmDisabled={!valid}
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        <NpcPicker npcs={npcs} value={npcId} onChange={chooseNpc} required error={!npcId} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label={t('npc-alias')}
            name="npc-alias"
            value={name}
            onChange={(event) => setName(event.target.value)}
            helperText={t('npc-alias-help')}
            sx={{ flex: 1 }}
          />
          <Box sx={{ width: { xs: '100%', sm: 140 } }}>
            <NumericInput
              label={t('npc-count')}
              name="npc-count"
              integer
              min={1}
              max={FACTION_NPC_MAX_COUNT}
              value={count}
              onChange={setCount}
              error={!isValidNpcCount(count)}
            />
          </Box>
        </Stack>
        {withNotes && (
          <TextField
            label={t('notes')}
            name="npc-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
        )}
      </Stack>
    </RmuDialog>
  );
};

/**
 * NPC entries (spec 055): image, alias (and the NPC's name when it differs), category and level, specimens and notes,
 * with edit and remove buttons when `onEdit` and `onRemove` are given.
 */
export const NpcEntryList: FC<{
  entries: NpcEntry[];
  /** The NPCs of the entries, for their image and name; an entry whose NPC is missing shows its alias only. */
  npcs: Npc[] | undefined;
  onEdit?: (index: number) => void;
  onRemove?: (index: number) => void;
  disabled?: boolean;
  emptyText?: string;
}> = ({ entries, npcs, onEdit, onRemove, disabled = false, emptyText }) => {
  const { t } = useTranslation();
  if (entries.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {emptyText ?? t('npcs-empty')}
      </Typography>
    );
  }
  return (
    <Stack spacing={1} role="list">
      {entries.map((entry, index) => {
        const npc = npcs?.find((each) => each.id === entry.npcId);
        const original = npc ? npcName(npc, t) : undefined;
        const secondary = [original && original !== entry.name ? original : undefined, npc && npcSummary(npc, t)]
          .filter(Boolean)
          .join(' · ');
        return (
          <Stack
            key={`${entry.npcId}-${entry.name}-${index}`}
            role="listitem"
            direction="row"
            spacing={{ xs: 1, sm: 1.5 }}
            sx={{ alignItems: 'center', minWidth: 0, border: 1, borderColor: 'divider', borderRadius: 1, p: 1 }}
          >
            <EntityAvatar
              name={entry.name}
              imageUrl={npc ? npcImage(npc) : undefined}
              kind="npc"
              size={48}
              variant="rounded"
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                {entry.name}
              </Typography>
              {secondary && (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ overflowWrap: 'anywhere' }}>
                  {secondary}
                </Typography>
              )}
              {entry.notes && (
                <Typography variant="caption" color="text.secondary" component="div" sx={{ whiteSpace: 'pre-line' }}>
                  {entry.notes}
                </Typography>
              )}
            </Box>
            <Tooltip title={t('npc-count')}>
              <Chip size="small" label={`× ${entry.count}`} aria-label={t('npc-count-n', { count: entry.count })} />
            </Tooltip>
            {onEdit && (
              <IconButton aria-label={t('edit')} size="small" disabled={disabled} onClick={() => onEdit(index)}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onRemove && (
              <IconButton aria-label={t('delete')} size="small" disabled={disabled} onClick={() => onRemove(index)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        );
      })}
    </Stack>
  );
};
