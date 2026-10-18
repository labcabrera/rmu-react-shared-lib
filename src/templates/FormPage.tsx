import React, { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SaveIcon from '@mui/icons-material/Save';
import { Box, Button, Paper } from '@mui/material';
import NotFound from '../display/NotFound';
import LayoutBase from '../layouts/LayoutBase';
import ConfirmDialog from '../ui/ConfirmDialog';
import ErrorState from '../ui/states/ErrorState';
import LoadingState from '../ui/states/LoadingState';
import { bottomOffset, usePhone } from './responsive';
import { Breadcrumb } from './types';

export interface FormPageProps {
  breadcrumbs: Breadcrumb[];
  onSave: () => void;
  onCancel: () => void;
  /** Disables save, usually while the form is invalid or a save is in flight. */
  saveDisabled?: boolean;
  /** Unsaved changes: cancel asks for confirmation and closing the tab warns. */
  dirty?: boolean;
  leftPanel?: ReactNode;
  /** Extra header actions, shown before cancel and save. */
  actions?: ReactNode[];
  /**
   * Edit pages: the useEntity state of the entity being edited. Until it is loaded the page shows the
   * loading, not found or error state instead of the form, and save is disabled.
   */
  entity?: { entity: unknown; error: unknown; notFound: boolean; refresh: () => void };
  children: ReactNode;
}

/** Standard create/edit page: header with cancel/save and an unsaved-changes guard. */
export default function FormPage({
  breadcrumbs,
  onSave,
  onCancel,
  saveDisabled = false,
  dirty = false,
  leftPanel,
  actions = [],
  entity,
  children,
}: FormPageProps) {
  const { t } = useTranslation();
  const isPhone = usePhone();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const pending = entity !== undefined && entity.entity === undefined;
  let content: ReactNode = children;
  if (pending) {
    content = <LoadingState variant="detail" />;
    if (entity.notFound) content = <NotFound />;
    else if (entity.error) content = <ErrorState error={entity.error} onRetry={entity.refresh} />;
  }

  const cancel = () => (dirty ? setConfirmOpen(true) : onCancel());
  const cancelButton = (
    <Button key="cancel" onClick={cancel} fullWidth={isPhone}>
      {t('cancel')}
    </Button>
  );
  const saveButton = (
    <Button
      key="save"
      variant="contained"
      startIcon={<SaveIcon />}
      onClick={onSave}
      disabled={saveDisabled || pending}
      fullWidth={isPhone}
    >
      {t('save')}
    </Button>
  );
  const extraActions = actions.map((action, index) => (
    <React.Fragment key={`action-${index}`}>{action}</React.Fragment>
  ));
  // Phones get cancel/save in a bar fixed at the bottom; larger screens in the header.
  const headerActions = isPhone ? extraActions : [...extraActions, cancelButton, saveButton];

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={headerActions} leftPanel={pending ? undefined : leftPanel}>
      {content}
      {isPhone && (
        <>
          <Box sx={{ height: 72 }} />
          <Paper
            square
            elevation={8}
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: bottomOffset(),
              p: 1.5,
              display: 'flex',
              gap: 1,
              zIndex: (theme) => theme.zIndex.appBar,
            }}
          >
            {cancelButton}
            {saveButton}
          </Paper>
        </>
      )}
      <ConfirmDialog
        open={confirmOpen}
        title={t('unsaved-changes')}
        message={t('discard-changes-message')}
        confirmLabel={t('discard')}
        destructive
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onCancel();
        }}
      />
    </LayoutBase>
  );
}
