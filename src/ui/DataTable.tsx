import React, { ReactNode } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /**
   * Fixed width (px or any CSS length). When a column sets one, the table uses a fixed layout: the columns without
   * a width share the rest, and tables of the same columns (the groups of a grouped list) line up (spec 017).
   */
  width?: number | string;
}

/**
 * Table that never overflows the page: a scrollable table from the `sm` breakpoint up, and one card
 * per row (header: value) on phones, or always scrollable with `cardsOnMobile={false}`.
 */
export default function DataTable<T>({
  columns,
  rows,
  getKey,
  cardsOnMobile = true,
  size = 'small',
  onRowClick,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  cardsOnMobile?: boolean;
  size?: 'small' | 'medium';
  /** Makes rows (cards on phones) clickable. */
  onRowClick?: (row: T) => void;
}) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const fixedLayout = columns.some((column) => column.width !== undefined);

  if (isPhone && cardsOnMobile) {
    return (
      <Stack spacing={1}>
        {rows.map((row) => (
          <Card
            key={getKey(row)}
            variant="outlined"
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            sx={onRowClick ? { cursor: 'pointer' } : undefined}
          >
            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
              {columns.map((column) => (
                <Stack key={column.key} direction="row" sx={{ justifyContent: 'space-between', gap: 2, py: 0.25 }}>
                  <Typography variant="body2" color="text.secondary">
                    {column.header}
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ textAlign: 'right' }}>
                    {column.render(row)}
                  </Typography>
                </Stack>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  }

  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size={size} sx={fixedLayout ? { tableLayout: 'fixed' } : undefined}>
        {fixedLayout && (
          <colgroup>
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
        )}
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={getKey(row)}
              hover={Boolean(onRowClick)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={onRowClick ? { cursor: 'pointer' } : undefined}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
