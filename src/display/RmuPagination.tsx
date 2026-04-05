import React, { Dispatch, FC, ReactNode, SetStateAction } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Pagination, Select } from '@mui/material';

const RmuPagination: FC<{
  page: number;
  pageSize: number;
  totalPages: number;
  sizes?: number[];
  setPage: Dispatch<SetStateAction<number>>;
  setPageSize: Dispatch<SetStateAction<number>>;
}> = ({ page, pageSize, totalPages, sizes = [12, 24, 48, 96], setPage, setPageSize }) => {
  return (
    <Box mt={5} display="flex" justifyContent="center">
      <Pagination
        count={totalPages}
        page={page + 1}
        onChange={(_e, v) => setPage(v - 1)}
        size="large"
        shape="rounded"
        variant="outlined"
      />
      <FormControl size="small" sx={{ minWidth: 120 }}>
        <InputLabel id="page-size-label">Rows</InputLabel>
        <Select
          labelId="page-size-label"
          id="page-size-select"
          value={String(pageSize)}
          label="Size"
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {sizes.map((v) => (
            <MenuItem key={v} value={String(v)}>
              {v}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default RmuPagination;
