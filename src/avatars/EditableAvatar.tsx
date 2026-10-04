import React, { FC, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import ImageSelectorDialog from '../images/ImageSelectorDialog';

const defaultImage = 'https://assets.labcabrera.com/images/generic/configuration.png';

const EditableAvatar: FC<{
  imageUrl: string | null | undefined;
  altImageUrl?: string;
  variant?: 'circular' | 'rounded' | 'square';
  onImageChange: (newImageUrl: string) => void;
}> = ({ imageUrl, altImageUrl, variant = 'circular', onImageChange }) => {
  const effectiveImage = imageUrl || altImageUrl || defaultImage;
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Avatar
        src={effectiveImage}
        variant={variant}
        sx={{
          width: {
            xs: 80,
            sm: 56,
            md: 72,
            lg: 200,
          },
          height: {
            xs: 80,
            sm: 56,
            md: 72,
            lg: 200,
          },
        }}
        onClick={() => setDialogOpen(true)}
      />
      <ImageSelectorDialog
        value={effectiveImage}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSelect={(image) => onImageChange(image)}
      />
    </>
  );
};

export default EditableAvatar;
