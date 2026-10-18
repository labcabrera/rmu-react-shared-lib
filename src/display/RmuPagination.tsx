import React, { FC } from 'react';
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import { Button, Menu, MenuItem, Pagination, Stack } from '@mui/material';
import { usePhone } from '../templates/responsive';

const RmuPagination: FC<{
  page: number;
  pageSize: number;
  totalPages: number;
  sizes?: number[];
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
}> = ({ page, pageSize, totalPages, sizes = [12, 24, 48, 96], setPage, setPageSize }) => {
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
    setPageSize(size);
    handleClose();
  };

  return (
    // Phones show no siblings of the current page: at most seven 44 px items, which fit a 390 px screen.
    <Stack direction="row" sx={{ mt: 5, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(_e, v) => setPage(v - 1)}
        size="large"
        siblingCount={isPhone ? 0 : 1}
      />
      <Button size="large" variant="text" onClick={handleClick} endIcon={<ArrowDropDownSharpIcon />}>
        {pageSize}
      </Button>
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
