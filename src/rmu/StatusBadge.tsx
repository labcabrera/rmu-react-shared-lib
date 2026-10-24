import React, { FC, MouseEvent, ReactElement, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, ButtonBase, Chip, Popover, Stack, Tooltip, Typography } from '@mui/material';

export type StatusBadgeColor = 'default' | 'error' | 'warning' | 'success' | 'info';

export interface StatusBadgeProps {
  /** Status key: picks the abbreviation (`status-abbr-<status>`) when `abbr` is not given. */
  status: string;
  /** Full name of the status, shown in the tooltip, the popover and to screen readers. */
  label: string;
  /** Short text; by default the `status-abbr-<status>` translation, or nothing (icon only) when it is missing. */
  abbr?: string;
  /** Value after the abbreviation: a penalty, an amount, rounds… */
  value?: string | number | null;
  /** Longer explanation for the tooltip and the popover. */
  detail?: ReactNode;
  color?: StatusBadgeColor;
  /** Image of the status (an `Avatar` of images/icons). */
  avatar?: ReactElement;
  /** Or an icon element, when there is no image. */
  icon?: ReactElement;
  size?: 'small' | 'medium';
}

/**
 * Compact status chip for dense places (tables, list cards, the combat board): icon, abbreviation and value. Hover
 * shows the full name and its explanation; a click or tap opens them in a popover, so it also works on touch. The
 * click does not reach the row or card around it (spec 017).
 */
const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  label,
  abbr,
  value,
  detail,
  color = 'default',
  avatar,
  icon,
  size = 'small',
}) => {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const short = abbr ?? t(`status-abbr-${status}`, { defaultValue: '' });
  const valueText = value === undefined || value === null || value === '' ? '' : `${value}`;
  // Without an image or an abbreviation the badge falls back to the full name: it never renders empty.
  const text = [short || (avatar || icon ? '' : label), valueText].filter(Boolean).join(' ');
  const full = valueText ? `${label} ${valueText}` : label;

  const open = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchor(event.currentTarget);
  };
  const close = (event: object) => {
    (event as MouseEvent).stopPropagation?.();
    setAnchor(null);
  };

  const summary = (
    <Stack spacing={0.5} sx={{ maxWidth: 280 }}>
      <Typography variant="subtitle2">{full}</Typography>
      {detail && (
        <Typography variant="body2" color="text.secondary" component="div">
          {detail}
        </Typography>
      )}
    </Stack>
  );

  return (
    <>
      <Tooltip title={anchor ? '' : summary} disableHoverListener={!!anchor}>
        {/* A span, not a button: badges often sit inside clickable rows, cards and actor cells. */}
        <ButtonBase
          component="span"
          aria-label={full}
          aria-haspopup="dialog"
          onClick={open}
          // Phones: the tap area reaches 44 px around the small chip.
          sx={(theme) => ({
            borderRadius: 999,
            flexShrink: 0,
            [theme.breakpoints.down('sm')]: { minWidth: 44, minHeight: 44 },
            '&.Mui-focusVisible': { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: 1 },
          })}
        >
          <Chip
            component="span"
            size={size}
            color={color}
            avatar={avatar}
            icon={avatar ? undefined : icon}
            label={text}
            sx={{
              cursor: 'pointer',
              fontVariantNumeric: 'tabular-nums',
              // Icon-only badge: the avatar alone, without the empty label's padding.
              ...(!text && {
                '& .MuiChip-label': { display: 'none' },
                '& .MuiChip-avatar, & .MuiChip-icon': { mx: 0.25 },
              }),
            }}
          />
        </ButtonBase>
      </Tooltip>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={close}
        onClick={(event) => event.stopPropagation()}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { role: 'dialog', 'aria-label': full } }}
      >
        <Box sx={{ p: 1.5 }}>{summary}</Box>
      </Popover>
    </>
  );
};

export default StatusBadge;
