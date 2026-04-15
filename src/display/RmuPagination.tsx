import React, { Dispatch, FC, SetStateAction } from 'react';
import ArrowDropDownSharpIcon from '@mui/icons-material/ArrowDropDownSharp';
import { Button, Menu, MenuItem, Pagination, Stack } from '@mui/material';

const RmuPagination: FC<{
  page: number;
  pageSize: number;
  totalPages: number;
  sizes?: number[];
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
}> = ({ page, pageSize, totalPages, sizes = [12, 24, 48, 96], setPage, setPageSize }) => {
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
    <Stack mt={5} direction="row" display="flex" justifyContent="center">
      <Pagination count={totalPages} page={page + 1} onChange={(_e, v) => setPage(v - 1)} size="large" />
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
