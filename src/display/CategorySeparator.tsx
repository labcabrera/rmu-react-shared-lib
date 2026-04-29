import React, { FC, ReactNode } from 'react';
import { Box, Divider, Typography } from '@mui/material';

const CategorySeparator: FC<{ text: string; children?: ReactNode }> = ({ text, children }) => {
  return (
    <Box sx={{ mt: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" color="text.secondary">
          {text}
        </Typography>
        {children ? <Box sx={{ ml: 2 }}>{children}</Box> : null}
      </Box>
      <Divider sx={{ mt: 1 }} />
    </Box>
  );
};

export default CategorySeparator;
