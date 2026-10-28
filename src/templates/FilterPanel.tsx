import React, { FC, ReactNode, useId, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, ButtonBase, Collapse, Divider, Stack, Typography } from '@mui/material';

/**
 * Filters of a list as a column of sections (spec 046, decision 6): the side column of ListPage with
 * `filtersLayout="side"` on large screens, and the content of the filters drawer below them.
 */
export const FilterPanel: FC<{ children: ReactNode }> = ({ children }) => (
  <Stack spacing={1.5} divider={<Divider flexItem />} sx={{ width: '100%', minWidth: 0 }}>
    {children}
  </Stack>
);

/** One group of filters with its title, collapsible. `hidden` (a contextual filter that does not apply) hides it. */
export const FilterSection: FC<{
  title: ReactNode;
  children: ReactNode;
  /** Can be folded; `true` by default. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  hidden?: boolean;
}> = ({ title, children, collapsible = true, defaultOpen = true, hidden = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  if (hidden) return null;
  const heading = (
    <Typography variant="overline" color="text.secondary" component="span" sx={{ lineHeight: 1.6 }}>
      {title}
    </Typography>
  );
  return (
    <Box component="section">
      {collapsible ? (
        <ButtonBase
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen(!open)}
          sx={{ width: '100%', justifyContent: 'space-between', borderRadius: 1, minHeight: 32 }}
        >
          {heading}
          <ExpandMoreIcon
            fontSize="small"
            sx={{ transition: 'transform 150ms', transform: open ? 'rotate(180deg)' : 'none', color: 'text.secondary' }}
          />
        </ButtonBase>
      ) : (
        <Box sx={{ minHeight: 32, display: 'flex', alignItems: 'center' }}>{heading}</Box>
      )}
      <Collapse in={!collapsible || open} id={contentId}>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {children}
        </Stack>
      </Collapse>
    </Box>
  );
};

export default FilterPanel;
