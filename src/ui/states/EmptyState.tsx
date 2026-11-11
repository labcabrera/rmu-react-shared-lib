import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Stack, Typography } from '@mui/material';

/**
 * Shown when a list or a search has no results. `action` is usually a button to create the first item. `dense` is
 * the one-line form for panels, tables and dialogs (spec 066, decision 8): no big icon, secondary text.
 */
const EmptyState: FC<{
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  dense?: boolean;
}> = ({ title, description, action, icon, dense = false }) => {
  const { t } = useTranslation();
  if (dense) {
    return (
      <Stack spacing={0.5} sx={{ py: 1.5, color: 'text.secondary' }} role="status">
        <Typography variant="body2" color="text.secondary">
          {title ?? t('no-results')}
        </Typography>
        {description && <Typography variant="caption">{description}</Typography>}
        {action}
      </Stack>
    );
  }
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', textAlign: 'center', py: 6, color: 'text.secondary' }}>
      {icon ?? <InboxOutlinedIcon sx={{ fontSize: 48 }} />}
      <Typography variant="h6" color="text.primary">
        {title ?? t('no-results')}
      </Typography>
      {description && <Typography>{description}</Typography>}
      {action}
    </Stack>
  );
};

export default EmptyState;
