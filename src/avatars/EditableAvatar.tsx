import React, { FC, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import { resolveAssetUrl } from '../config/asset-url';
import ImageSelectorDialog from '../images/ImageSelectorDialog';

const defaultImage = 'images/generic/configuration.png';

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
        src={resolveAssetUrl(effectiveImage)}
        variant={variant}
        // From lg it fills its column up to 200 px: the side panel of detail pages is narrower than that below
        // ~1440 px, and a fixed 200 px image spilled over the content next to it (spec 017).
        sx={{
          width: { xs: 80, sm: 56, md: 72, lg: '100%' },
          height: { xs: 80, sm: 56, md: 72, lg: 'auto' },
          maxWidth: { lg: 200 },
          aspectRatio: '1',
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
