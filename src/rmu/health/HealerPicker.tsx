import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import NumericInput from '../../inputs/NumericInput';
import CharacterPicker from '../../selectors/CharacterPicker';
import { formatBonus } from '../character/StatPill';

/** A character who can heal: its Medicine and Herbalism total bonuses, and its avatar and faction for the picker. */
export type HealerCandidate = {
  id: string;
  name: string;
  medicine?: number;
  herbalism?: number;
  imageUrl?: string | null;
  factionId?: string;
  factionName?: string;
};

export type HealerMode = 'self' | 'character' | 'external';

/** The healer chosen: the character itself, another character of the campaign or game, or an external healer. */
export type HealerSelection =
  | { mode: 'self' }
  | { mode: 'character'; characterId?: string }
  | { mode: 'external'; name: string; medicine: number; herbalism?: number };

/** Name and bonuses of the healer chosen, or undefined while it is incomplete. */
export const resolveHealer = (
  selection: HealerSelection,
  characters: HealerCandidate[],
  selfId?: string
): { characterId?: string; name: string; medicine: number; herbalism?: number; external: boolean } | undefined => {
  if (selection.mode === 'external') {
    if (!selection.name.trim()) return undefined;
    return { name: selection.name, medicine: selection.medicine, herbalism: selection.herbalism, external: true };
  }
  const id = selection.mode === 'self' ? selfId : selection.characterId;
  const healer = characters.find((character) => character.id === id);
  if (!healer) return undefined;
  return {
    characterId: healer.id,
    name: healer.name,
    medicine: healer.medicine ?? 0,
    herbalism: healer.herbalism,
    external: false,
  };
};

const bonusText = (healer: HealerCandidate, medicineLabel: string, herbalismLabel: string) =>
  [
    `${medicineLabel} ${formatBonus(healer.medicine ?? 0)}`,
    healer.herbalism !== undefined ? `${herbalismLabel} ${formatBonus(healer.herbalism)}` : undefined,
  ]
    .filter(Boolean)
    .join(' · ');

/**
 * Chooses who heals: the character itself (`selfId`, shown only when it is given), another character (with its
 * Medicine and Herbalism bonuses) or an external healer typed by hand (name, Medicine bonus, optional Herbalism).
 */
const HealerPicker: FC<{
  /** Candidates, the character itself included when `selfId` is given. */
  characters: HealerCandidate[];
  value: HealerSelection;
  onChange: (value: HealerSelection) => void;
  /** Id of the injured character, for the `self` mode. */
  selfId?: string;
  disabled?: boolean;
}> = ({ characters, value, onChange, selfId, disabled = false }) => {
  const { t } = useTranslation();
  const others = characters.filter((character) => character.id !== selfId);
  const self = characters.find((character) => character.id === selfId);
  const medicineLabel = t('medicine');
  const herbalismLabel = t('herbalism');

  const changeMode = (mode: HealerMode | null) => {
    if (!mode || mode === value.mode) return;
    if (mode === 'self') onChange({ mode: 'self' });
    else if (mode === 'character') onChange({ mode: 'character', characterId: others[0]?.id });
    else onChange({ mode: 'external', name: '', medicine: 0 });
  };

  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={value.mode}
        onChange={(_, mode: HealerMode | null) => changeMode(mode)}
        disabled={disabled}
        aria-label={t('healer')}
      >
        {self && <ToggleButton value="self">{t('self')}</ToggleButton>}
        <ToggleButton value="character" disabled={others.length === 0}>
          {t('character')}
        </ToggleButton>
        <ToggleButton value="external">{t('healer-external')}</ToggleButton>
      </ToggleButtonGroup>

      {value.mode === 'self' && self && (
        <TextField
          label={t('healer')}
          value={`${self.name} (${bonusText(self, medicineLabel, herbalismLabel)})`}
          disabled
          fullWidth
        />
      )}

      {value.mode === 'character' && (
        <CharacterPicker
          label={t('healer')}
          options={others.map((character) => ({
            id: character.id,
            name: character.name,
            imageUrl: character.imageUrl,
            factionId: character.factionId,
            factionName: character.factionName,
            secondary: bonusText(character, medicineLabel, herbalismLabel),
          }))}
          value={value.characterId}
          onChange={(characterId) => characterId && onChange({ mode: 'character', characterId })}
          disabled={disabled}
        />
      )}

      {value.mode === 'external' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <TextField
            label={t('name')}
            value={value.name}
            onChange={(event) => onChange({ ...value, name: event.target.value })}
            disabled={disabled}
            fullWidth
          />
          <NumericInput
            label={t('healer-medicine-bonus')}
            value={value.medicine}
            onChange={(medicine) => onChange({ ...value, medicine: medicine ?? 0 })}
            integer
            disabled={disabled}
          />
          <NumericInput
            label={t('healer-herbalism-bonus')}
            value={value.herbalism ?? null}
            onChange={(herbalism) => onChange({ ...value, herbalism: herbalism ?? undefined })}
            integer
            disabled={disabled}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default HealerPicker;
