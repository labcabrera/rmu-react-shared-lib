import React, { FC } from 'react';
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import { Button, Menu, MenuItem, Pagination, Stack } from '@mui/material';
import { usePhone } from '../templates/responsive';

/**
 * Page selector of a list (0-based `page`). Without `setPageSize` the page size menu is hidden; `dense` is the
 * small form under a table or inside a panel (spec 066, decision 13).
 */
const RmuPagination: FC<{
  page: number;
  pageSize: number;
  totalPages: number;
  sizes?: number[];
  setPage: (page: number) => void;
  setPageSize?: (size: number) => void;
  dense?: boolean;
}> = ({ page, pageSize, totalPages, sizes = [12, 24, 48, 96], setPage, setPageSize, dense = false }) => {
  const isPhone = usePhone();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const onClick = (size: number) => {
    setPageSize?.(size);
    handleClose();
  };

  return (
    // Phones show no siblings of the current page: at most seven 44 px items, which fit a 390 px screen.
    <Stack
      direction="row"
      sx={{ mt: dense ? 1 : 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}
    >
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(_e, v) => setPage(v - 1)}
        size={dense ? 'medium' : 'large'}
        siblingCount={isPhone ? 0 : 1}
      />
      {setPageSize && (
        <Button
          size={dense ? 'medium' : 'large'}
          variant="text"
          onClick={handleClick}
          endIcon={<ArrowDropDownSharpIcon />}
        >
          {pageSize}
        </Button>
      )}
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {sizes.map((v) => (
          <MenuItem key={v} value={String(v)} onClick={() => onClick(v)}>
            {v}
          </MenuItem>
        ))}
      </Menu>
    </Stack>
  );
};

export default RmuPagination;
