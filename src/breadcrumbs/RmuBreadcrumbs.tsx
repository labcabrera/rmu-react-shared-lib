import React, { FC, ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { Box, Breadcrumbs, Link, Stack, Typography } from '@mui/material';

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
  const firstItem = items[0];
  const firstItemIsHome = firstItem?.link === '/' || firstItem?.name?.toLowerCase() === 'home';
  const breadcrumbItems = showHome && !firstItemIsHome ? [{ name: 'Home', link: '/' }, ...items] : items;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{ mb: 1, direction: 'row', justifyContent: 'space-between', minHeight: 50, alignItems: 'center' }}
    >
      <Box sx={{ width: '100%' }}>
        <Breadcrumbs
          separator={<ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
          aria-label="breadcrumb"
          sx={{
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
            const isHome = showHome && idx === 0 && (firstItemIsHome || it.link === '/');
            const isLast = idx === breadcrumbItems.length - 1;
            const content = (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, lineHeight: 1 }}>
                {isHome && <HomeOutlinedIcon sx={{ display: 'block', fontSize: 16 }} />}
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
