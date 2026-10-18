import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CloseIcon from '@mui/icons-material/Close';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import UploadIcon from '@mui/icons-material/Upload';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Tab,
  Tabs,
} from '@mui/material';
import { MediaImage } from '../api/image.dto';
import ImageCategorySelector from './ImageCategorySelector';
import ImageUploadEditor from './ImageUploadEditor';

export type ImageDialogProps = {
  value?: string;
  open: boolean;
  maxWidth?: 'md' | 'lg' | 'xl';
  onClose: () => void;
  onSelect: (image: string) => void;
  onUpload?: (image: string) => void;
};

function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function ImageSelectorDialog({
  value,
  open,
  maxWidth = 'xl',
  onClose,
  onSelect: onImageSelected,
  onUpload: onImageUploaded,
}: ImageDialogProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<MediaImage>();

  // With onUpload, an uploaded image is applied right away; without it, it becomes the selection.
  const handleUploaded = (image: MediaImage) => {
    setSelectedImage(image);
    onImageUploaded?.(image.storageKey || image.url);
  };

  const handleSelect = () => {
    if (!selectedImage) return;
    // Store the path relative to the assets root (see config/asset-url.ts), not the public URL.
    onImageSelected(selectedImage.storageKey || selectedImage.url);
    onClose();
  };

  const handleClose = () => {
    setSelectedImage(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>
        {t('images')}
        <IconButton
          aria-label={t('close')}
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<UploadIcon />} iconPosition="start" label={t('upload-image')} />
          <Tab icon={<ImageSearchIcon />} iconPosition="start" label={t('select-image')} />
        </Tabs>
        <Divider />
        <TabPanel value={tab} index={0}>
          <ImageUploadEditor value={value} onUploaded={handleUploaded} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          <ImageCategorySelector selectedImageId={selectedImage?.id} onSelect={setSelectedImage} />
        </TabPanel>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleClose}>
          {t('close')}
        </Button>
        <Button variant="contained" color="success" onClick={handleSelect} disabled={!selectedImage}>
          {t('select')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
