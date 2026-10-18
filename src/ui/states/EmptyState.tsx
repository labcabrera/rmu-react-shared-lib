import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Stack, Typography } from '@mui/material';

/** Shown when a list or a search has no results. `action` is usually a button to create the first item. */
const EmptyState: FC<{ title?: string; description?: string; action?: ReactNode; icon?: ReactNode }> = ({
  title,
  description,
  action,
  icon,
}) => {
  const { t } = useTranslation();
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
