import { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { Box, GlobalStyles, useTheme } from '@mui/material';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  ButtonWithTooltip,
  codeBlockPlugin,
  CodeToggle,
  CreateLink,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  imagePlugin,
  InsertCodeBlock,
  insertImage$,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  maxLengthPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  Separator,
  StrikeThroughSupSubToggles,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
  UndoRedo,
  useCellValue,
  usePublisher,
  viewMode$,
  type ViewMode,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { resolveAssetUrl } from '../config/asset-url';
import { MarkdownEditorMode, readEditorMode, storeEditorMode } from './editor-mode';
import { useMdxTranslation } from './mdx-translation';

export type MarkdownImageChoice = { src: string; alt?: string };

export type MarkdownEditorProps = {
  /** The initial Markdown. Read once: remount the editor (a new `key`) to load another text. */
  markdown: string;
  onChange: (markdown: string) => void;
  /** Uploads an image pasted, dropped or chosen from the device and returns the path to store (`uploads/…`). */
  onUploadImage?: (file: File) => Promise<string>;
  /** Lets the user pick an image already uploaded; resolves to undefined when cancelled. */
  onPickImage?: () => Promise<MarkdownImageChoice | undefined>;
  /** Maximum length of the Markdown. */
  maxLength?: number;
  placeholder?: string;
  /** Minimum height of the editing area, in pixels. */
  minHeight?: number;
  readOnly?: boolean;
};

const ROOT_CLASS = 'rmu-markdown-editor';
const CONTENT_CLASS = 'rmu-markdown-editor-content';

/** Toolbar button to insert an image picked from the gallery of the document. */
const PickImageButton = ({ onPickImage }: { onPickImage: NonNullable<MarkdownEditorProps['onPickImage']> }) => {
  const { t } = useTranslation();
  const insertImage = usePublisher(insertImage$);
  return (
    <ButtonWithTooltip
      title={t('markdown-editor-pick-image')}
      onClick={async () => {
        const choice = await onPickImage();
        if (choice) insertImage({ src: choice.src, altText: choice.alt ?? '', title: '' });
      }}
    >
      <CollectionsOutlinedIcon fontSize="small" />
    </ButtonWithTooltip>
  );
};

/** Remembers the mode the user switched to (Visual or Markdown). */
const ModeTracker = () => {
  const mode = useCellValue(viewMode$);
  useEffect(() => {
    if (mode === 'rich-text' || mode === 'source') storeEditorMode(mode);
  }, [mode]);
  return null;
};

/**
 * Rich text editor that reads and writes Markdown (workspace spec 102, decision 6), on MDXEditor. It has two modes,
 * Visual and Markdown (the raw text), switched at the right of the toolbar; the last one used is remembered. Only
 * Markdown is produced: no HTML, JSX or underline.
 *
 * It is exported from `@labcabrera-rmu/rmu-react-shared-lib/markdown-editor`, not from the main entry, so the
 * application loads it (and Lexical, CodeMirror and its CSS) only where it edits.
 */
export const MarkdownEditor = forwardRef<MDXEditorMethods, MarkdownEditorProps>(
  ({ markdown, onChange, onUploadImage, onPickImage, maxLength, placeholder, minHeight = 320, readOnly }, ref) => {
    const theme = useTheme();
    const translation = useMdxTranslation();
    const initialMode: MarkdownEditorMode = useMemo(() => readEditorMode(), []);
    const preview = useCallback(async (src: string) => resolveAssetUrl(src), []);

    const plugins = useMemo(
      () => [
        headingsPlugin({ allowedHeadingLevels: [1, 2, 3, 4] }),
        quotePlugin(),
        listsPlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        imagePlugin({
          imageUploadHandler: onUploadImage ?? null,
          imagePreviewHandler: preview,
          disableImageResize: true,
          allowSetImageDimensions: false,
        }),
        codeBlockPlugin({ defaultCodeBlockLanguage: '' }),
        markdownShortcutPlugin(),
        diffSourcePlugin({ viewMode: initialMode }),
        ...(maxLength ? [maxLengthPlugin(maxLength)] : []),
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper options={['rich-text', 'source'] satisfies ViewMode[]}>
              <ModeTracker />
              <UndoRedo />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <BoldItalicUnderlineToggles options={['Bold', 'Italic']} />
              <StrikeThroughSupSubToggles options={['Strikethrough']} />
              <CodeToggle />
              <Separator />
              <ListsToggle />
              <Separator />
              <CreateLink />
              <InsertImage />
              {onPickImage && <PickImageButton onPickImage={onPickImage} />}
              <InsertTable />
              <InsertThematicBreak />
              <InsertCodeBlock />
            </DiffSourceToggleWrapper>
          ),
        }),
      ],
      // The plugins are read once, when the editor mounts.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    const dark = theme.palette.mode === 'dark';
    const { palette } = theme;

    return (
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          '&:focus-within': { borderColor: 'primary.main' },
        }}
      >
        <GlobalStyles
          styles={{
            // The editor and its popups (dialogs, menus) share the root class, so the colors reach the portals too.
            [`.${ROOT_CLASS}`]: {
              '--basePageBg': palette.background.paper,
              '--baseBase': palette.background.default,
              '--baseBgSubtle': palette.action.hover,
              '--baseBg': palette.background.paper,
              '--baseBgHover': palette.action.hover,
              '--baseBgActive': palette.action.selected,
              '--baseLine': palette.divider,
              '--baseBorder': palette.divider,
              '--baseBorderHover': palette.text.disabled,
              '--baseSolid': palette.text.secondary,
              '--baseSolidHover': palette.text.primary,
              '--baseText': palette.text.secondary,
              '--baseTextContrast': palette.text.primary,
              '--accentSolid': palette.primary.main,
              '--accentSolidHover': palette.primary.dark,
              '--accentText': palette.primary.main,
              '--accentTextContrast': palette.primary.contrastText,
              '--accentBorder': palette.primary.main,
              '--accentBg': palette.action.selected,
              '--accentBgHover': palette.action.hover,
              '--accentBgActive': palette.action.selected,
              fontFamily: theme.typography.fontFamily,
              color: palette.text.primary,
            },
            [`.${CONTENT_CLASS}`]: {
              minHeight,
              padding: theme.spacing(2),
              fontFamily: theme.typography.fontFamily,
              fontSize: theme.typography.body1.fontSize,
              lineHeight: 1.7,
              color: palette.text.primary,
              '& h1': { ...theme.typography.h4, margin: theme.spacing(2, 0, 1.5) },
              '& h2': { ...theme.typography.h5, margin: theme.spacing(3, 0, 1) },
              '& h3': { ...theme.typography.h6, margin: theme.spacing(2, 0, 1) },
              '& h4': { ...theme.typography.subtitle1, fontWeight: 600, margin: theme.spacing(1.5, 0, 1) },
              '& blockquote': {
                borderLeft: `3px solid ${palette.info.main}`,
                margin: theme.spacing(1.5, 0),
                padding: theme.spacing(0.5, 2),
                color: palette.text.secondary,
              },
              '& a': { color: palette.primary.main },
              '& img': { maxWidth: '100%', height: 'auto' },
              '& table': { borderCollapse: 'collapse' },
              '& th, & td': { border: `1px solid ${palette.divider}`, padding: theme.spacing(0.5, 1) },
              '& code': { fontFamily: 'monospace', fontSize: '0.9em', backgroundColor: palette.action.hover },
            },
          }}
        />
        <MDXEditor
          ref={ref}
          markdown={markdown}
          onChange={(value) => onChange(value)}
          plugins={plugins}
          translation={translation}
          className={`${ROOT_CLASS}${dark ? ' dark-theme' : ''}`}
          contentEditableClassName={CONTENT_CLASS}
          placeholder={placeholder}
          readOnly={readOnly}
          suppressHtmlProcessing
        />
      </Box>
    );
  }
);

MarkdownEditor.displayName = 'MarkdownEditor';

export type { MDXEditorMethods as MarkdownEditorMethods };
export default MarkdownEditor;
