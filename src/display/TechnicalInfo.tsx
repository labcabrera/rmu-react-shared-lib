import React, { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Box, Paper } from '@mui/material';

type Props = {
  title?: string;
  defaultExpanded?: boolean;
};

const TechnicalInfo: FC<PropsWithChildren<Props>> = ({ children, title, defaultExpanded = false }) => {
  const { t } = useTranslation();
  return (
    <Box sx={{ mt: 5 }}>
      <Accordion defaultExpanded={defaultExpanded} disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2">{title ?? t('technical-info')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Paper elevation={5}>
            <Box
              component="pre"
              sx={{
                fontSize: '0.75rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                m: 0,
                p: 2,
                borderRadius: 2,
                maxWidth: '100%',
                overflowX: 'auto',
              }}
            >
              {children}
            </Box>
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default TechnicalInfo;
