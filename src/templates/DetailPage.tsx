import React, { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import EditDocumentIcon from '@mui/icons-material/EditDocument';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Typography } from '@mui/material';
import DeleteButton from '../buttons/DeleteButton';
import EditButton from '../buttons/EditButton';
import RefreshButton from '../buttons/RefreshButton';
import { EntityState } from '../data/useEntity';
import DeleteDialog from '../dialogs/DeleteDialog';
import NotFound from '../display/NotFound';
import TechnicalInfo from '../display/TechnicalInfo';
import LayoutBase from '../layouts/LayoutBase';
import ErrorState from '../ui/states/ErrorState';
import LoadingState from '../ui/states/LoadingState';
import { usePhone } from './responsive';
import { Breadcrumb } from './types';

export interface DetailPageProps<T> {
  breadcrumbs: Breadcrumb[];
  /** State from useEntity: the page handles loading, not found and errors with it. */
  entity: EntityState<T>;
  children: (entity: T) => ReactNode;
  leftPanel?: (entity: T) => ReactNode;
  /** Title of the collapsed side panel on phones (usually the entity name). Defaults to "Summary". */
  summaryTitle?: (entity: T) => ReactNode;
  onEdit?: (entity: T) => void;
  /** Called after the user confirms the deletion. */
  onDelete?: (entity: T) => void;
  /** Text of the delete confirmation; a function can include the entity name. */
  deleteMessage?: string | ((entity: T) => string);
  /** Extra header actions, shown before refresh, edit and delete. */
  actions?: (entity: T) => ReactNode[];
  /** Shows the raw JSON in a collapsed TechnicalInfo panel (default true). */
  technicalInfo?: boolean;
}

/** Standard view page: header with refresh/edit/delete, side panel, content and its states. */
export default function DetailPage<T>({
  breadcrumbs,
  entity: state,
  children,
  leftPanel,
  summaryTitle,
  onEdit,
  onDelete,
  deleteMessage,
  actions,
  technicalInfo = true,
}: DetailPageProps<T>) {
  const { t } = useTranslation();
  const isPhone = usePhone();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { entity, error, notFound } = state;

  if (!entity) {
    let content: ReactNode = <LoadingState variant="detail" />;
    if (notFound) content = <NotFound />;
    else if (error) content = <ErrorState error={error} onRetry={state.refresh} />;
    return <LayoutBase breadcrumbs={breadcrumbs}>{content}</LayoutBase>;
  }

  const headerActions = [
    ...(actions?.(entity) ?? []).map((action, index) => (
      <React.Fragment key={`action-${index}`}>{action}</React.Fragment>
    )),
    <RefreshButton key="refresh" onClick={state.refresh} />,
    ...(onEdit
      ? [
          isPhone ? (
            <EditButton key="edit" onClick={() => onEdit(entity)} />
          ) : (
            <Button
              key="edit"
              variant="outlined"
              size="small"
              startIcon={<EditDocumentIcon />}
              onClick={() => onEdit(entity)}
              sx={{ mx: 1 }}
            >
              {t('edit')}
            </Button>
          ),
        ]
      : []),
    ...(onDelete ? [<DeleteButton key="delete" onClick={() => setDeleteOpen(true)} />] : []),
  ];

  return (
    <LayoutBase breadcrumbs={breadcrumbs} actions={headerActions} leftPanel={isPhone ? undefined : leftPanel?.(entity)}>
      {isPhone && leftPanel && (
        // Phones: the side panel collapses above the content, so the content (and its tabs) start at the top.
        <Accordion disableGutters sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {summaryTitle?.(entity) ?? t('summary')}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>{leftPanel(entity)}</Box>
          </AccordionDetails>
        </Accordion>
      )}
      {children(entity)}
      {technicalInfo && (
        <TechnicalInfo>
          <pre>{JSON.stringify(entity, null, 2)}</pre>
        </TechnicalInfo>
      )}
      {onDelete && (
        <DeleteDialog
          open={deleteOpen}
          message={
            typeof deleteMessage === 'function'
              ? deleteMessage(entity)
              : (deleteMessage ?? t('confirmation-delete-message'))
          }
          onClose={() => setDeleteOpen(false)}
          onDelete={() => {
            setDeleteOpen(false);
            onDelete(entity);
          }}
        />
      )}
    </LayoutBase>
  );
}
