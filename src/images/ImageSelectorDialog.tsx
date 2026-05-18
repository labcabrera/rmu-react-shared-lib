import React, { useState } from 'react';
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
}: ImageDialogProps) {
  const [tab, setTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState<MediaImage>();

  const handleUploaded = (image: MediaImage) => {
    setSelectedImage(image);
  };

  const handleSelect = () => {
    if (!selectedImage) return;
    onImageSelected(selectedImage.url);
    onClose();
  };

  const handleClose = () => {
    setSelectedImage(undefined);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth}>
      <DialogTitle>
        Images
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          size="large"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<UploadIcon />} iconPosition="start" label="Upload image" />
          <Tab icon={<ImageSearchIcon />} iconPosition="start" label="Select image" />
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
          Close
        </Button>
        <Button variant="contained" color="success" onClick={handleSelect} disabled={!selectedImage}>
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
}
