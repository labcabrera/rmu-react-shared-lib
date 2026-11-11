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
  SxProps,
  Theme,
} from '@mui/material';
import RmuPagination from '../display/RmuPagination';
import EmptyState from './states/EmptyState';
import { activationProps } from './activation-props';

/** Server or local paging under the table (0-based page). */
export interface DataTablePagination {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
  sizes?: number[];
}

export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  /** Cell styles of the column (a tabular font, a dimmed column…). */
  cellSx?: SxProps<Theme>;
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
  emptyTitle,
  pagination,
  footer,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  getKey: (row: T) => string;
  cardsOnMobile?: boolean;
  size?: 'small' | 'medium';
  /** Makes rows (cards on phones) clickable. */
  onRowClick?: (row: T) => void;
  /** Text of the dense empty state shown instead of an empty table (spec 066, decision 10). */
  emptyTitle?: string;
  pagination?: DataTablePagination;
  /** A totals row or similar under the body (table only; cards ignore it). */
  footer?: ReactNode;
}) {
  const theme = useTheme();
  const isPhone = useMediaQuery(theme.breakpoints.down('sm'));
  const fixedLayout = columns.some((column) => column.width !== undefined);

  if (rows.length === 0 && emptyTitle !== undefined) return <EmptyState dense title={emptyTitle} />;

  const pager =
    pagination && pagination.totalPages > 1 ? (
      <RmuPagination
        dense
        page={pagination.page}
        totalPages={pagination.totalPages}
        setPage={pagination.onPageChange}
        pageSize={pagination.pageSize ?? 0}
        setPageSize={pagination.onPageSizeChange}
        sizes={pagination.sizes}
      />
    ) : null;

  if (isPhone && cardsOnMobile) {
    return (
      <>
        <Stack spacing={1}>
          {rows.map((row) => (
            <Card
              key={getKey(row)}
              variant="outlined"
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              role={onRowClick ? 'button' : undefined}
              {...(onRowClick ? activationProps(() => onRowClick(row)) : {})}
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
        {pager}
      </>
    );
  }

  return (
    <>
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
                {...(onRowClick ? activationProps(() => onRowClick(row)) : {})}
                sx={onRowClick ? { cursor: 'pointer' } : undefined}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} align={column.align} sx={column.cellSx}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
          {footer}
        </Table>
      </TableContainer>
      {pager}
    </>
  );
}
