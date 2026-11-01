import React, { FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import HelpOutlineIcon from '@mui/icons-material/HelpOutlineOutlined';
import { Box, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import RmuDialog from '../dialogs/RmuDialog';

export interface OptionHelp {
  key: string;
  label: string;
  /** The value in use (the one of the campaign). */
  value?: ReactNode;
  defaultValue?: ReactNode;
  description: ReactNode;
}

/**
 * One window that explains a block of options (spec 066, decision 17): for each option its name, the value in use,
 * the default and what it does. Replaces a help button per row.
 */
const OptionsHelpDialog: FC<{ open: boolean; title: string; options: OptionHelp[]; onClose: () => void }> = ({
  open,
  title,
  options,
  onClose,
}) => {
  const { t } = useTranslation();
  return (
    <RmuDialog open={open} title={title} maxWidth="md" onClose={onClose}>
      <Stack component="dl" sx={{ m: 0 }} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {options.map((option) => (
          <Box key={option.key} sx={{ py: 1.5 }} data-testid={`option-help-${option.key}`}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{ justifyContent: 'space-between', alignItems: { sm: 'baseline' }, gap: { xs: 0.25, sm: 2 } }}
            >
              <Typography component="dt" variant="subtitle2" sx={{ fontWeight: 600 }}>
                {option.label}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ flexShrink: 0 }}>
                {option.value !== undefined && (
                  <Typography variant="body2" component="span">
                    <Typography component="span" variant="body2" color="text.secondary">
                      {`${t('options-help-current')}: `}
                    </Typography>
                    <Box component="span" sx={{ fontWeight: 600 }}>
                      {option.value}
                    </Box>
                  </Typography>
                )}
                {option.defaultValue !== undefined && (
                  <Typography variant="body2" component="span" color="text.secondary">
                    {`${t('options-help-default')}: ${String(option.defaultValue)}`}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <Typography component="dd" variant="body2" color="text.secondary" sx={{ m: 0, mt: 0.5 }}>
              {option.description}
            </Typography>
          </Box>
        ))}
      </Stack>
    </RmuDialog>
  );
};

/** The help button of a block header that opens its OptionsHelpDialog. */
export const OptionsHelpButton: FC<{ title: string; options: OptionHelp[]; label?: string }> = ({
  title,
  options,
  label,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const name = label ?? t('options-help');
  return (
    <>
      <Tooltip title={name}>
        <IconButton size="small" aria-label={name} onClick={() => setOpen(true)}>
          <HelpOutlineIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <OptionsHelpDialog open={open} title={title} options={options} onClose={() => setOpen(false)} />
    </>
  );
};

export default OptionsHelpDialog;
