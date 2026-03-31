import React, { FC, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import ImageSelectorDialog from "../images/ImageSelectorDialog";

const EditableAvatar: FC<{
  imageUrl: string;
  variant?: 'circular' | 'rounded' | 'square';
  images: string[],
  onImageChange: (newImageUrl: string) => void;
}> = ({ imageUrl, images, variant = 'circular', onImageChange }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Avatar
        src={imageUrl}
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
        value={imageUrl}
        open={dialogOpen}
        images={images}
        onClose={() => setDialogOpen(false)}
        onSelect={(image) => onImageChange(image)}
      />
    </>
  );
};

export default EditableAvatar;
