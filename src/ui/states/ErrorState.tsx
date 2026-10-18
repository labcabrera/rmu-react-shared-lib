import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { Button, Stack, Typography } from '@mui/material';
import { isApiError } from '../../data/api-error';

/** Shown in place of content that failed to load, with an optional retry. */
const ErrorState: FC<{ error?: unknown; title?: string; onRetry?: () => void }> = ({ error, title, onRetry }) => {
  const { t } = useTranslation();
  const description = isApiError(error) ? t(error.messageKey) : error instanceof Error ? error.message : undefined;
  return (
    <Stack spacing={1} role="alert" sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
      <ErrorOutlineIcon color="error" sx={{ fontSize: 48 }} />
      <Typography variant="h6">{title ?? t('something-went-wrong')}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {onRetry && (
        <Button variant="outlined" onClick={onRetry}>
          {t('retry')}
        </Button>
      )}
    </Stack>
  );
};

export default ErrorState;
