import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ItemHolder } from '../../api/strategic-item.dto';
import type { TreasureAwardResult } from '../../api/treasure.dto';
import RmuDialog from '../../dialogs/RmuDialog';
import TreasureRollPanel from './TreasureRollPanel';

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

/** {@link TreasureRollPanel} in a dialog: it starts afresh every time it opens, and closes after an award. */
const TreasureDialog: FC<TreasureDialogProps> = ({ open, onClose, codes, gameId, holder, holderPicker, onAwarded }) => {
  const { t } = useTranslation();
  return (
    <RmuDialog open={open} title={t('treasure-roll-title')} maxWidth="md" onClose={onClose}>
      <TreasureRollPanel
        key={codes ?? ''}
        codes={codes}
        gameId={gameId}
        holder={holder}
        holderPicker={holderPicker}
        onAwarded={(result) => {
          onAwarded?.(result);
          onClose();
        }}
      />
    </RmuDialog>
  );
};

export default TreasureDialog;
