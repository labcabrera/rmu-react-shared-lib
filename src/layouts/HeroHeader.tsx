import React, { FC, ReactNode, useEffect, useState } from 'react';
import { Avatar, Box, ButtonBase, Card, Fade, Stack, Typography } from '@mui/material';
import { resolveAssetUrl } from '../config/asset-url';

export interface HeroHeaderProps {
  title: string;
  /** Small line above the title (level and profession, type…). */
  overline?: ReactNode;
  image?: string | null;
  /** Chips under the title (race, profession, faction…). Hidden when compact. */
  chips?: ReactNode;
  /** Resource bars (HP, PP, XP). Hidden when compact. */
  resources?: ReactNode;
  /** Key numbers. They stay visible when compact, from md up. */
  pills?: ReactNode;
  actions?: ReactNode;
  /** `view-transition-name` of the image, to morph from the list card. */
  imageTransitionName?: string;
  /** Makes the image a button (for example to change it). */
  onImageClick?: () => void;
  /** Accessible name of the image button. */
  imageActionLabel?: string;
}

/** Height of the condensed bar: the full header switches to it once it has scrolled under this line. */
const COMPACT_BAR_HEIGHT = 72;

const appBarHeight = () =>
  parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--rmu-app-bar-height')) || 0;

/**
 * Whether the element has scrolled up under the app bar and the condensed bar. An IntersectionObserver, not a
 * fixed scroll distance: headers have different heights (chips wrap), and the switch must happen exactly when the
 * full header leaves the view.
 */
const useScrolledPast = (element: HTMLElement | null) => {
  const [past, setPast] = useState(false);
  useEffect(() => {
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const top = appBarHeight() + COMPACT_BAR_HEIGHT;
    const observer = new IntersectionObserver(
      ([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < top),
      { rootMargin: `-${top}px 0px 0px 0px` }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return past;
};

/**
 * Entity header that replaces the side panel of a detail page: image, title, chips, resources and key numbers.
 * The full header scrolls with the page; once it has left the view, a condensed bar (image, title, key numbers and
 * actions) sticks under the app bar over the content. The bar takes no room in the layout, so the content does not
 * jump when it appears, and nothing (the section tabs) scrolls under the full header (spec 017).
 */
const HeroHeader: FC<HeroHeaderProps> = ({
  title,
  overline,
  image,
  chips,
  resources,
  pills,
  actions,
  imageTransitionName,
  onImageClick,
  imageActionLabel,
}) => {
  const [full, setFull] = useState<HTMLDivElement | null>(null);
  const compact = useScrolledPast(full);

  const avatar = (size: number | { xs: number; md: number }, transitionName?: string) => (
    <Avatar
      variant="rounded"
      src={image ? resolveAssetUrl(image) : undefined}
      alt={title}
      sx={(theme) => ({
        width: size,
        height: size,
        borderRadius: `${theme.radius.md}px`,
        border: 1,
        borderColor: 'divider',
        viewTransitionName: transitionName,
      })}
    />
  );
  const imageButton = (size: number | { xs: number; md: number }, transitionName?: string) =>
    onImageClick ? (
      <ButtonBase onClick={onImageClick} aria-label={imageActionLabel} sx={{ borderRadius: 1, flexShrink: 0 }}>
        {avatar(size, transitionName)}
      </ButtonBase>
    ) : (
      avatar(size, transitionName)
    );
  const actionsRow = actions && (
    <Stack direction="row" sx={{ alignItems: 'center', ml: 'auto' }}>
      {actions}
    </Stack>
  );

  return (
    <>
      {/* Zero-height sticky anchor before the full header: it is already stuck under the app bar when the condensed
          bar appears, and the bar floats over the content without taking room. */}
      <Box
        sx={(theme) => ({
          position: 'sticky',
          top: 'var(--rmu-app-bar-height, 0px)',
          zIndex: theme.zIndex.appBar - 1,
          height: 0,
        })}
      >
        <Fade in={compact} mountOnEnter unmountOnExit>
          <Card sx={{ position: 'absolute', top: 0, left: 0, right: 0, bgcolor: 'background.paper', boxShadow: 4 }}>
            <Stack
              direction="row"
              sx={{ alignItems: 'center', gap: { xs: 1.5, md: 2.5 }, px: { xs: 1.5, md: 2.5 }, py: 1, minWidth: 0 }}
            >
              {imageButton(40)}
              <Typography variant="h6" component="div" noWrap sx={{ flex: '1 1 auto', minWidth: 0 }}>
                {title}
              </Typography>
              {pills && (
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'nowrap', display: { xs: 'none', md: 'flex' } }}>
                  {pills}
                </Stack>
              )}
              {actionsRow}
            </Stack>
          </Card>
        </Fade>
      </Box>
      <Card ref={setFull} sx={{ mt: 1, bgcolor: 'background.light' }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            gap: { xs: 1.5, md: 2.5 },
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 1.5, md: 2.5 },
            flexWrap: { xs: 'wrap', lg: 'nowrap' },
          }}
        >
          {imageButton({ xs: 64, md: 96 }, imageTransitionName)}
          <Box sx={{ flex: '1 1 220px', minWidth: 0 }}>
            {overline && (
              <Typography variant="overline" color="text.secondary" component="div" sx={{ lineHeight: 1.6 }}>
                {overline}
              </Typography>
            )}
            {/* Up to two lines: long names (campaigns, factions) lost most of their text on one line. */}
            <Typography
              variant="h4"
              component="h1"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                overflowWrap: 'anywhere',
              }}
            >
              {title}
            </Typography>
            {chips && (
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mt: 1 }}>
                {chips}
              </Stack>
            )}
          </Box>
          {resources && (
            <Stack spacing={1} sx={{ flex: { xs: '1 1 100%', sm: '1 1 240px', lg: '0 0 280px' }, minWidth: 0 }}>
              {resources}
            </Stack>
          )}
          {pills && (
            <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', flex: { xs: '1 1 100%', lg: '0 1 auto' } }}>
              {pills}
            </Stack>
          )}
          {actionsRow}
        </Stack>
      </Card>
    </>
  );
};

export default HeroHeader;
