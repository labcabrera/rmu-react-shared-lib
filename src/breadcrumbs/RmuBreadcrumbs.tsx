import React, { FC, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Box, Breadcrumbs, Link, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';

type BreadcrumbItem = {
  name: string;
  link?: string;
};

interface RmuBreadcrumbsProps {
  items: BreadcrumbItem[];
  children?: ReactNode;
  showHome?: boolean;
}

const RmuBreadcrumbs: FC<RmuBreadcrumbsProps> = ({ items, children, showHome = true }) => {
  const { t } = useTranslation();
  const firstItem = items[0];
  const firstItemIsHome = firstItem?.link === '/' || firstItem?.name?.toLowerCase() === 'home';
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const allItems = showHome && !firstItemIsHome ? [{ name: t('home'), link: '/' }, ...items] : items;
  // Phones only show the parent (as the way back) and the current page.
  const breadcrumbItems = isPhone && allItems.length > 2 ? allItems.slice(-2) : allItems;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ mb: 1, direction: 'row', justifyContent: 'space-between', minHeight: 50, alignItems: 'center' }}
    >
      <Box sx={{ width: '100%' }}>
        <Breadcrumbs
          separator={<ChevronRightIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
          aria-label={t('breadcrumb')}
          sx={{
            fontSize: { xs: '1rem', sm: '1.0625rem' },
            fontWeight: 600,
            '& .MuiBreadcrumbs-ol': {
              alignItems: 'center',
            },
            '& .MuiBreadcrumbs-separator': {
              mx: 0.75,
              display: 'flex',
              alignItems: 'center',
            },
          }}
        >
          {breadcrumbItems.map((it, idx) => {
            const display = it.name;
            const isHome = showHome && it.link === '/' && idx === 0;
            const isLast = idx === breadcrumbItems.length - 1;
            const content = (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, lineHeight: 1 }}>
                {isHome && <HomeOutlinedIcon sx={{ display: 'block', fontSize: 20 }} />}
                <Box component="span" sx={{ lineHeight: 1 }}>
                  {display}
                </Box>
              </Box>
            );

            return it.link ? (
              <Link
                key={idx}
                component={RouterLink}
                color={isLast ? 'text.primary' : 'text.secondary'}
                underline="hover"
                to={it.link}
                title={it.name}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  // A comfortable touch target on phones, where the parent link is the way back.
                  minHeight: { xs: 44, sm: 'auto' },
                  minWidth: { xs: 44, sm: 'auto' },
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  lineHeight: 1,
                  verticalAlign: 'middle',
                }}
              >
                {content}
              </Link>
            ) : (
              <Typography
                key={idx}
                component="span"
                title={it.name}
                color="text.primary"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  lineHeight: 1,
                  verticalAlign: 'middle',
                }}
              >
                {content}
              </Typography>
            );
          })}
        </Breadcrumbs>
      </Box>
      <Stack spacing={1} direction="row" sx={{ flexShrink: 0 }}>
        {children}
      </Stack>
    </Stack>
  );
};

export default RmuBreadcrumbs;
