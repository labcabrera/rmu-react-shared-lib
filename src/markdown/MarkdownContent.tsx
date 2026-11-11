import { FC, useMemo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Divider,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import remarkGfm from 'remark-gfm';
import { defaultMarkdownImage, defaultMarkdownLink, MarkdownLink } from './markdown-urls';
import { remarkHeadingIds } from './remark-heading-ids';

export type MarkdownContentProps = {
  markdown: string;
  /** Where a link points; by default anchors, external URLs in a new tab and app routes. */
  resolveLink?: (href: string) => MarkdownLink;
  /** URL to show an image, or undefined to leave it out (only its text is shown). By default, only app files. */
  resolveImage?: (src: string) => string | undefined;
  /**
   * Stretch every image to the width of the text, as the wiki does with its SVG figures (they have no size of their
   * own). By default an image keeps its size and only shrinks to fit.
   */
  fullWidthImages?: boolean;
};

// Room for the shell's header when the browser scrolls to an anchor.
const anchorSx = { scrollMarginTop: 80 };

// The ids of the headings come from remarkHeadingIds: `{#id}` or the slug of the text.
const buildComponents = (
  resolveLink: (href: string) => MarkdownLink,
  resolveImage: (src: string) => string | undefined,
  fullWidthImages: boolean
): Components => ({
  h1: ({ id, children }) => (
    <Typography variant="h4" component="h1" id={id} sx={{ ...anchorSx, mt: 3, mb: 2 }}>
      {children}
    </Typography>
  ),
  h2: ({ id, children }) => (
    <Typography variant="h5" component="h2" id={id} sx={{ ...anchorSx, mt: 5, mb: 1.5 }}>
      {children}
    </Typography>
  ),
  h3: ({ id, children }) => (
    <Typography variant="h6" component="h3" id={id} sx={{ ...anchorSx, mt: 3, mb: 1 }}>
      {children}
    </Typography>
  ),
  h4: ({ children }) => (
    <Typography variant="subtitle1" component="h4" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
      {children}
    </Typography>
  ),
  // A paragraph with only an image is a figure: a <figure> cannot go inside a <p>.
  p: ({ node, children }) => {
    const only = node?.children.length === 1 ? node.children[0] : undefined;
    if (only?.type === 'element' && only.tagName === 'img') return <>{children}</>;
    return (
      <Typography variant="body1" component="p" sx={{ mb: 1.5, lineHeight: 1.7 }}>
        {children}
      </Typography>
    );
  },
  a: ({ href, children }) => {
    const link = resolveLink(href ?? '');
    if (link.kind === 'route')
      return (
        <Link component={RouterLink} to={link.to}>
          {children}
        </Link>
      );
    if (link.kind === 'anchor') return <Link href={link.to}>{children}</Link>;
    return (
      <Link href={link.to} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    );
  },
  ul: ({ children, className }) => (
    <Box
      component="ul"
      sx={{
        pl: className?.includes('contains-task-list') ? 1 : 3,
        mt: 0,
        mb: 1.5,
        listStyle: className ? 'none' : undefined,
      }}
    >
      {children}
    </Box>
  ),
  ol: ({ children, start }) => (
    <Box component="ol" start={start} sx={{ pl: 3, mt: 0, mb: 1.5 }}>
      {children}
    </Box>
  ),
  li: ({ children }) => (
    <Typography variant="body1" component="li" sx={{ mb: 0.5, lineHeight: 1.7, '& > p': { mb: 0.5 } }}>
      {children}
    </Typography>
  ),
  blockquote: ({ children }) => (
    <Alert severity="info" variant="outlined" sx={{ my: 2, '& p:last-child': { mb: 0 } }}>
      {children}
    </Alert>
  ),
  hr: () => <Divider sx={{ my: 3 }} />,
  code: ({ children }) => (
    <Box
      component="code"
      sx={{ fontFamily: 'monospace', fontSize: '0.9em', px: 0.5, borderRadius: 0.5, bgcolor: 'action.hover' }}
    >
      {children}
    </Box>
  ),
  pre: ({ children }) => (
    <Box
      component="pre"
      sx={{
        p: 2,
        mb: 2,
        overflowX: 'auto',
        borderRadius: 1,
        bgcolor: 'action.hover',
        '& code': { bgcolor: 'transparent' },
      }}
    >
      {children}
    </Box>
  ),
  table: ({ children }) => (
    <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
      <Table size="small">{children}</Table>
    </TableContainer>
  ),
  thead: ({ children }) => <TableHead>{children}</TableHead>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableCell sx={{ fontWeight: 600, verticalAlign: 'bottom' }}>{children}</TableCell>,
  td: ({ children }) => <TableCell sx={{ verticalAlign: 'top' }}>{children}</TableCell>,
  // The text of the image is its caption. An image that may not be shown leaves only that text.
  img: ({ src, alt }) => {
    const url = resolveImage(typeof src === 'string' ? src : '');
    if (!url)
      return alt ? (
        <Typography component="span" variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          {alt}
        </Typography>
      ) : null;
    return (
      <Box component="figure" sx={{ mx: 0, my: 3 }}>
        <Box
          component="img"
          src={url}
          alt={alt ?? ''}
          loading="lazy"
          sx={{
            display: 'block',
            maxWidth: '100%',
            width: fullWidthImages ? '100%' : undefined,
            height: 'auto',
            borderRadius: 1,
          }}
        />
        {alt && (
          <Typography component="figcaption" variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            {alt}
          </Typography>
        )}
      </Box>
    );
  },
});

/**
 * A Markdown document rendered with the application's theme (workspace specs 099 and 102). GitHub Flavored Markdown
 * (tables, strikethrough, task lists); raw HTML is never rendered, so a document cannot run scripts or add styles.
 */
export const MarkdownContent: FC<MarkdownContentProps> = ({
  markdown,
  resolveLink = defaultMarkdownLink,
  resolveImage = defaultMarkdownImage,
  fullWidthImages = false,
}) => {
  const components = useMemo(
    () => buildComponents(resolveLink, resolveImage, fullWidthImages),
    [resolveLink, resolveImage, fullWidthImages]
  );
  return (
    // The first block (usually the title) starts at the top of the page, without its margin.
    <Box sx={{ minWidth: 0, overflowWrap: 'anywhere', '& > :first-child': { mt: 0 } }}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkHeadingIds]} components={components}>
        {markdown}
      </ReactMarkdown>
    </Box>
  );
};

export default MarkdownContent;
