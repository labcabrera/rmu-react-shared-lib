import React, { ChangeEvent, DragEvent, FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import {
  Alert,
  AlertTitle,
  alpha,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ImportIssue, ImportPreview, ImportResult } from '../api/character-export.dto';
import { isApiError } from '../data/api-error';
import RmuDialog from './RmuDialog';

/** Error codes of an import that have their own translation (`err-<code>`). */
const KNOWN_ERRORS = [
  'export-invalid-file',
  'export-too-large',
  'export-unknown-format',
  'export-format-too-new',
  'export-wrong-kind',
  'export-missing-reference',
  'export-character-ref-required',
];

export interface ImportRequest {
  /** The parsed JSON of the file. */
  file: unknown;
  fileName: string;
  /** The character chosen from a faction file. */
  characterRef?: string;
}

/** A failure shown in the dialog: an i18n key, the message of the API and the issues of an invalid file. */
interface ImportFailure {
  key: string;
  detail?: string;
  issues: ImportIssue[];
}

interface LoadedFile {
  file: unknown;
  fileName: string;
}

const issuesOf = (details: unknown): ImportIssue[] => {
  const issues = (details as { issues?: unknown } | undefined)?.issues;
  if (!Array.isArray(issues)) return [];
  return issues.map((issue: { path?: string; message?: string }) => ({
    code: 'export-invalid-file',
    message: String(issue.message ?? ''),
    path: issue.path,
  }));
};

export const toImportFailure = (err: unknown): ImportFailure => {
  if (isApiError(err)) {
    const code = err.code;
    return {
      key: code && KNOWN_ERRORS.includes(code) ? `err-${code}` : err.messageKey,
      detail: err.detail,
      issues: issuesOf(err.details),
    };
  }
  return { key: 'unexpected-error', detail: err instanceof Error ? err.message : String(err), issues: [] };
};

/** Groups issues by code, keeping the order of the first one of each code. */
const groupByCode = (issues: ImportIssue[]): [string, ImportIssue[]][] => {
  const groups = new Map<string, ImportIssue[]>();
  issues.forEach((issue) => groups.set(issue.code, [...(groups.get(issue.code) ?? []), issue]));
  return [...groups.entries()];
};

const issueLabel = (issue: ImportIssue) => issue.name || issue.id || issue.path || issue.message;

const IssueGroups: FC<{ issues: ImportIssue[]; severity: 'warning' | 'error' }> = ({ issues, severity }) => {
  const { t } = useTranslation();
  return (
    <Stack spacing={1}>
      {groupByCode(issues).map(([code, group]) => (
        <Alert key={code} severity={severity} variant="outlined">
          <AlertTitle>
            {t(code)} ({group.length})
          </AlertTitle>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {group.map((issue, index) => (
              <Typography key={index} component="li" variant="body2" title={issue.message}>
                {issueLabel(issue)}
              </Typography>
            ))}
          </Stack>
        </Alert>
      ))}
    </Stack>
  );
};

const PreviewView: FC<{
  preview: ImportPreview;
  characterRef: string | undefined;
  onCharacterRef: (ref: string) => void;
}> = ({ preview, characterRef, onCharacterRef }) => {
  const { t } = useTranslation();
  const chooseCharacter = preview.target === 'character' && preview.kind === 'faction';
  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">{preview.name}</Typography>
        <Typography variant="body2" color="text.secondary">
          {t('import-preview-source', {
            game: preview.source.gameName,
            faction: preview.source.factionName,
            date: new Date(preview.source.exportedAt).toLocaleDateString(),
          })}
        </Typography>
      </Box>
      {chooseCharacter && (
        <TextField
          select
          size="small"
          label={t('import-choose-character')}
          value={characterRef ?? ''}
          onChange={(e) => onCharacterRef(e.target.value)}
        >
          {preview.characters.map((character) => (
            <MenuItem key={character.ref} value={character.ref}>
              {character.name} · {character.raceName} · {t('level')} {character.level}
            </MenuItem>
          ))}
        </TextField>
      )}
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Chip label={`${t('import-preview-characters')}: ${preview.summary.characters}`} />
        <Chip label={`${t('import-preview-items')}: ${preview.summary.items}`} />
        <Chip label={`${t('import-preview-gold')}: ${preview.summary.gold}`} />
      </Stack>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Chip
          size="small"
          variant="outlined"
          label={`${t('import-format-version')}: ${preview.formatVersion} / ${preview.currentFormatVersion}`}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`${t('import-app-version')}: ${preview.appVersion} / ${preview.currentAppVersion}`}
        />
      </Stack>
      {preview.upgradedFrom !== undefined && (
        <Alert severity="info" variant="outlined">
          <AlertTitle>{t('import-upgraded-from', { version: preview.upgradedFrom })}</AlertTitle>
          <Stack component="ul" sx={{ m: 0, pl: 2 }}>
            {preview.steps.map((step) => (
              <Typography key={step.from} component="li" variant="body2">
                {t('import-upgrade-step', { from: step.from, to: step.to, description: step.description })}
              </Typography>
            ))}
          </Stack>
        </Alert>
      )}
      {preview.errors.length > 0 && <IssueGroups issues={preview.errors} severity="error" />}
      {preview.warnings.length > 0 && <IssueGroups issues={preview.warnings} severity="warning" />}
    </Stack>
  );
};

/**
 * Imports an export file (`*.rmu.json`, workspace spec 024): the user chooses or drops the file, the dialog asks
 * for the preview (`onPreview`, the `dryRun` call), shows the summary, the versions, the upgrade, the warnings and
 * the errors, lets the user choose the character of a faction file and imports it on confirm (`onImport`).
 */
const ImportDialog: FC<{
  open: boolean;
  title: string;
  subtitle?: string;
  onPreview: (request: ImportRequest) => Promise<ImportPreview>;
  onImport: (request: ImportRequest) => Promise<ImportResult>;
  onImported: (result: ImportResult) => void;
  onClose: () => void;
}> = ({ open, title, subtitle, onPreview, onImport, onImported, onClose }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<LoadedFile | null>(null);
  const [characterRef, setCharacterRef] = useState<string | undefined>(undefined);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [failure, setFailure] = useState<ImportFailure | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (open) return;
    setLoaded(null);
    setCharacterRef(undefined);
    setPreview(null);
    setFailure(null);
    setBusy(false);
  }, [open]);

  const requestPreview = async (file: LoadedFile, ref: string | undefined) => {
    setBusy(true);
    setFailure(null);
    try {
      const result = await onPreview({ ...file, characterRef: ref });
      setPreview(result);
      if (!ref && result.characterRef) setCharacterRef(result.characterRef);
    } catch (err) {
      setPreview(null);
      setFailure(toImportFailure(err));
    } finally {
      setBusy(false);
    }
  };

  const readFile = async (selected: File) => {
    setPreview(null);
    setCharacterRef(undefined);
    let parsed: unknown;
    try {
      parsed = JSON.parse(await selected.text());
    } catch {
      setLoaded(null);
      setFailure({ key: 'import-not-json', issues: [] });
      return;
    }
    const file = { file: parsed, fileName: selected.name };
    setLoaded(file);
    await requestPreview(file, undefined);
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (selected) void readFile(selected);
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    setDragging(false);
    const selected = e.dataTransfer.files?.[0];
    if (selected) void readFile(selected);
  };

  const handleCharacterRef = (ref: string) => {
    setCharacterRef(ref);
    if (loaded) void requestPreview(loaded, ref);
  };

  const handleConfirm = async () => {
    if (!loaded) return;
    setBusy(true);
    setFailure(null);
    try {
      onImported(await onImport({ ...loaded, characterRef }));
    } catch (err) {
      setFailure(toImportFailure(err));
    } finally {
      setBusy(false);
    }
  };

  const canImport = !!loaded && !!preview && preview.errors.length === 0 && !busy;

  return (
    <RmuDialog
      open={open}
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
      onCancel={onClose}
      onClose={undefined}
      buttons={
        <Button variant="contained" disabled={!canImport} onClick={() => void handleConfirm()}>
          {t('import')}
        </Button>
      }
    >
      <Stack spacing={2}>
        <Box
          data-testid="import-drop-zone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          sx={{
            p: 2,
            border: '1px dashed',
            borderColor: dragging ? 'primary.main' : 'divider',
            borderRadius: 1,
            backgroundColor: (theme) => (dragging ? alpha(theme.palette.primary.main, 0.08) : 'transparent'),
            textAlign: 'center',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".json,application/json"
            hidden
            data-testid="import-file-input"
            onChange={handleInput}
          />
          <Button startIcon={<UploadFileIcon />} onClick={() => inputRef.current?.click()} disabled={busy}>
            {t('import-choose-file')}
          </Button>
          <Typography variant="body2" color="text.secondary">
            {loaded ? loaded.fileName : t('import-drop-file')}
          </Typography>
        </Box>
        {busy && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={28} />
          </Box>
        )}
        {failure && (
          <Alert severity="error">
            <AlertTitle>{t(failure.key)}</AlertTitle>
            {failure.detail}
            {failure.issues.length > 0 && (
              <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                {failure.issues.map((issue, index) => (
                  <Typography key={index} component="li" variant="body2">
                    {issue.path}: {issue.message}
                  </Typography>
                ))}
              </Stack>
            )}
          </Alert>
        )}
        {preview && <PreviewView preview={preview} characterRef={characterRef} onCharacterRef={handleCharacterRef} />}
      </Stack>
    </RmuDialog>
  );
};

export default ImportDialog;
