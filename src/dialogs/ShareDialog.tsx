import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Alert,
  Autocomplete,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { EntityShare, SHARE_LEVELS, ShareLevel } from '../api/common.dto';
import type { Friend } from '../api/friendship.api';
import RmuDialog from './RmuDialog';

export interface ShareDialogProps {
  open: boolean;
  onClose: () => void;
  /** Name of the entity, for the title. */
  entityName: string;
  shares: EntityShare[];
  /** Accepted friends of the owner; undefined while loading. */
  friends: Friend[] | undefined;
  /** A rulebook entity: a write share counts as read, since only admins change it (spec 069). */
  system?: boolean;
  onShare: (userId: string, level: ShareLevel) => Promise<unknown>;
  onUnshare: (userId: string) => Promise<unknown>;
}

/**
 * Who an entity is shared with, and with which level (spec 069, decision 10). Only friends can be added. The caller
 * calls the API and refreshes `shares`; a failed call is the caller's to notify.
 */
const ShareDialog: FC<ShareDialogProps> = ({ open, onClose, entityName, shares, friends, system, onShare, onUnshare }) => {
  const { t } = useTranslation();
  const [friend, setFriend] = useState<Friend | null>(null);
  const [level, setLevel] = useState<ShareLevel>('read');
  const [busy, setBusy] = useState(false);
  const available = (friends ?? []).filter((f) => !shares.some((s) => s.userId === f.userId));

  const run = (action: () => Promise<unknown>) => {
    setBusy(true);
    action()
      .catch(() => undefined)
      .finally(() => setBusy(false));
  };

  const add = () => {
    if (!friend) return;
    run(() => onShare(friend.userId, level).then(() => setFriend(null)));
  };

  // The name of the new share's level field, outside the JSX: the i18n lint reads strings there as visible text.
  const newLevelName = 'level';

  const levelField = (value: ShareLevel, onChange: (value: ShareLevel) => void, name: string) => (
    <TextField
      select
      size="small"
      name={name}
      label={t('share-level')}
      value={value}
      disabled={busy}
      onChange={(e) => onChange(e.target.value as ShareLevel)}
      sx={{ minWidth: 140 }}
    >
      {SHARE_LEVELS.map((option) => (
        <MenuItem key={option} value={option}>
          {t(`share-level-${option}`)}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <RmuDialog open={open} onClose={onClose} maxWidth="sm" title={t('share-title', { name: entityName })}>
      <Stack spacing={2}>
        {system && <Alert severity="info">{t('share-system-read-only')}</Alert>}
        {shares.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('share-none')}
          </Typography>
        ) : (
          <List dense disablePadding data-testid="share-list">
            {shares.map((share) => (
              <ListItem
                key={share.userId}
                disableGutters
                secondaryAction={
                  <Tooltip title={t('share-remove')}>
                    <span>
                      <IconButton
                        edge="end"
                        aria-label={t('share-remove')}
                        disabled={busy}
                        onClick={() => run(() => onUnshare(share.userId))}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                }
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center', width: '100%', pr: 6 }}>
                  <ListItemText primary={share.userName} />
                  {levelField(share.level, (value) => run(() => onShare(share.userId, value)), `level-${share.userId}`)}
                </Stack>
              </ListItem>
            ))}
          </List>
        )}
        <Typography variant="subtitle2">{t('share-add')}</Typography>
        {friends !== undefined && friends.length === 0 ? (
          <Alert severity="info">{t('share-no-friends')}</Alert>
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
            <Autocomplete
              size="small"
              sx={{ flex: 1, minWidth: 200 }}
              options={available}
              loading={friends === undefined}
              value={friend}
              disabled={busy}
              onChange={(_e, value) => setFriend(value)}
              getOptionLabel={(option) => option.userName}
              isOptionEqualToValue={(option, value) => option.userId === value.userId}
              renderInput={(params) => <TextField {...params} name="friend" label={t('share-friend')} />}
            />
            {levelField(level, setLevel, newLevelName)}
            <Button variant="contained" onClick={add} disabled={!friend || busy}>
              {t('share-action')}
            </Button>
          </Stack>
        )}
      </Stack>
    </RmuDialog>
  );
};

export default ShareDialog;
