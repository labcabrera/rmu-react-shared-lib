import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from 'react-oidc-context';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { deleteImage, fetchImages, updateImage } from '../api/image.api';
import { ImageCategory, imagePath, isBaseImage, MediaImage, MediaImagePage } from '../api/image.dto';
import { isAdmin } from '../auth/roles';
import { resolveAssetUrl } from '../config/asset-url';
import DeleteDialog from '../dialogs/DeleteDialog';

export type ImageCategorySelectorProps = {
  defaultCategory?: ImageCategory;
  selectedImageId?: string;
  categories?: string[];
  onSelect?: (image: MediaImage) => void;
  /** Called after an upload of the user is deleted, so the caller can drop it from its selection. */
  onDeleted?: (image: MediaImage) => void;
};

/** The file name of a path without its extension: `images/races/elf-01.png` → `elf-01`. */
const fileName = (path: string): string => path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';

/**
 * Whether the signed-in user may edit or delete an image: only uploads, by their owner or an admin. Base
 * images (the files of rmu-mfe-assets) are read only (workspace spec 057). Only hides UI: media enforces it.
 */
export const canManageImage = (image: MediaImage, userId: string | undefined, admin: boolean): boolean =>
  !isBaseImage(image) && (admin || (!!userId && image.owner === userId));


export default function ImageCategorySelector({
  defaultCategory = 'avatars',
  selectedImageId,
  categories = ['actions', 'avatars', 'generic', 'items', 'npcs', 'photos', 'professions', 'races', 'user-data'],
  onSelect,
  onDeleted,
}: ImageCategorySelectorProps) {
  const auth = useAuth();
  const { t } = useTranslation();
  const admin = isAdmin(auth);
  const userId = auth.user?.profile?.sub;
  const [reload, setReload] = useState(0);
  const [editing, setEditing] = useState<MediaImage>();
  const [editAltText, setEditAltText] = useState('');
  const [deleting, setDeleting] = useState<MediaImage>();
  const [saving, setSaving] = useState(false);
  const [category, setCategory] = useState<ImageCategory>(defaultCategory);
  const [images, setImages] = useState<MediaImagePage>();
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();

  useEffect(() => {
    if (!auth.isAuthenticated) return;
    let cancelled = false;
    setLoading(true);
    setErrorMessage(undefined);
    fetchImages(category, page, 25, auth)
      .then((response) => {
        if (cancelled) return;
        setImages(response);
        setTotalPages(response.pagination.totalPages);
      })
      .catch((err) => {
        if (!cancelled) setErrorMessage(err instanceof Error ? err.message : t('image-fetch-failed'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.isAuthenticated, category, page, reload]);

  const startEdit = (image: MediaImage) => {
    setEditing(image);
    setEditAltText(image.altText ?? '');
  };

  const handleSaveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateImage(auth, editing.id, { altText: editAltText.trim(), version: editing.version });
      setEditing(undefined);
      setReload((value) => value + 1);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('image-update-failed'));
      setEditing(undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const image = deleting;
    setDeleting(undefined);
    try {
      await deleteImage(auth, image.id);
      onDeleted?.(image);
      setReload((value) => value + 1);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : t('image-delete-failed'));
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<ImageCategory>) => {
    setCategory(event.target.value as ImageCategory);
    setPage(0);
  };

  return (
    <Stack spacing={2}>
      <FormControl fullWidth size="small">
        <InputLabel id="select-image-category-label">{t('category')}</InputLabel>
        <Select
          labelId="select-image-category-label"
          value={category}
          label={t('category')}
          onChange={handleCategoryChange}
        >
          {categories.map((imageCategory) => (
            <MenuItem key={imageCategory} value={imageCategory}>
              {imageCategory}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : errorMessage ? (
        <Alert severity="error">{errorMessage}</Alert>
      ) : images?.content.length === 0 ? (
        <Typography color="text.secondary">{t('no-images-found')}</Typography>
      ) : images ? (
        <ImageList cols={5} gap={2} sx={{ m: 0 }}>
          {images.content.map((image) => {
            const selected = selectedImageId === image.id;
            const base = isBaseImage(image);
            const manageable = canManageImage(image, userId, admin);
            // Base images have no alt text: their file name tells them apart (spec 057).
            const title = image.altText || image.originalFilename || fileName(imagePath(image)) || image.category;
            return (
              <ImageListItem
                key={image.id}
                onClick={() => onSelect?.(image)}
                sx={{
                  cursor: 'pointer',
                  border: 2,
                  borderColor: selected ? 'primary.main' : 'transparent',
                  borderRadius: 1,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                  '& img': {
                    height: '100%',
                    objectFit: 'cover',
                  },
                }}
              >
                <img src={resolveAssetUrl(imagePath(image))} alt={title} loading="lazy" />
                <Chip
                  size="small"
                  color={base ? 'default' : 'primary'}
                  label={t(base ? 'image-source-base' : 'image-source-user')}
                  sx={{ position: 'absolute', top: 4, left: 4, pointerEvents: 'none' }}
                />
                <ImageListItemBar
                  title={title}
                  subtitle={image.category}
                  sx={{ display: { xs: 'none', md: 'none', lg: 'flex' } }}
                />
                {manageable && (
                  <Stack
                    direction="row"
                    sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'background.paper', borderRadius: 1 }}
                  >
                    <Tooltip title={t('edit')}>
                      <IconButton
                        size="small"
                        aria-label={t('edit')}
                        onClick={(event) => {
                          event.stopPropagation();
                          startEdit(image);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        aria-label={t('delete')}
                        onClick={(event) => {
                          event.stopPropagation();
                          setDeleting(image);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                )}
              </ImageListItem>
            );
          })}
        </ImageList>
      ) : (
        <></>
      )}

      {totalPages > 1 && (
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={(_, value) => setPage(value - 1)}
          sx={{ alignSelf: 'center' }}
        />
      )}

      <Dialog open={!!editing} onClose={() => setEditing(undefined)} fullWidth maxWidth="xs">
        <DialogTitle>{t('edit-image')}</DialogTitle>
        <DialogContent>
          <TextField
            label={t('alternative-text')}
            size="small"
            value={editAltText}
            onChange={(event) => setEditAltText(event.target.value)}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(undefined)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={saving}>
            {t('save')}
          </Button>
        </DialogActions>
      </Dialog>

      <DeleteDialog
        open={!!deleting}
        message={t('image-delete-confirm')}
        onDelete={handleDelete}
        onClose={() => setDeleting(undefined)}
      />
    </Stack>
  );
}
