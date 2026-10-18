import React, { Children, FC, ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TuneIcon from '@mui/icons-material/Tune';
import { Badge, Box, Button, Drawer, Grid, Stack, Typography } from '@mui/material';
import { usePhone } from './responsive';

/**
 * Row of list filters with a consistent layout. Each child is one filter; the first is the main one
 * (usually a SearchField). Tablets and desktops show them in a row (two to four per line). Phones show
 * the first one plus a "Filters" button that opens the others in a bottom sheet; `activeCount` is shown
 * on that button.
 */
const FilterBar: FC<{ children: ReactNode; activeCount?: number }> = ({ children, activeCount = 0 }) => {
  const { t } = useTranslation();
  const isPhone = usePhone();
  const [open, setOpen] = useState(false);
  const [main, ...others] = Children.toArray(children);

  if (!isPhone || others.length === 0) {
    return (
      <Grid container spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
        {Children.toArray(children).map((child, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            {child}
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      <Stack direction="row" spacing={1} sx={{ mb: 1, alignItems: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>{main}</Box>
        <Badge badgeContent={activeCount} color="primary">
          <Button variant="outlined" startIcon={<TuneIcon />} onClick={() => setOpen(true)} sx={{ minHeight: 56 }}>
            {t('filters')}
          </Button>
        </Badge>
      </Stack>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={() => setOpen(false)}
        keepMounted
        slotProps={{ paper: { sx: { borderTopLeftRadius: 12, borderTopRightRadius: 12, p: 2, pb: 3 } } }}
      >
        <Typography variant="h6" sx={{ mb: 2 }}>
          {t('filters')}
        </Typography>
        <Stack spacing={2}>{others}</Stack>
        <Button variant="contained" onClick={() => setOpen(false)} sx={{ mt: 3 }} fullWidth>
          {t('close')}
        </Button>
      </Drawer>
    </>
  );
};

export default FilterBar;
