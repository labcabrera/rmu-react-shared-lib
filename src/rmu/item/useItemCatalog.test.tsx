import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ITEM_CATALOG_PAGE, useItemCatalog } from './ItemCatalogBrowser';

const auth = {};
vi.mock('react-oidc-context', () => ({ useAuth: () => auth }));
const fetchItems = vi.fn();
vi.mock('../../api/item.api', () => ({ fetchItems: (...args: unknown[]) => fetchItems(...args) }));

const page = (from: number, count: number, total: number) => ({
  content: Array.from({ length: count }, (_, i) => ({ id: `item-${from + i}` })),
  pagination: { page: 0, size: ITEM_CATALOG_PAGE, totalElements: total, totalPages: Math.ceil(total / ITEM_CATALOG_PAGE) },
});

describe('useItemCatalog', () => {
  beforeEach(() => fetchItems.mockReset());

  it('loads every page when the catalog is larger than one page', async () => {
    const total = ITEM_CATALOG_PAGE + 197;
    fetchItems.mockImplementation((_q: string, p: number) =>
      Promise.resolve(p === 0 ? page(0, ITEM_CATALOG_PAGE, total) : page(ITEM_CATALOG_PAGE, 197, total))
    );
    const { result } = renderHook(() => useItemCatalog({ exclude: ['item-0'] }));
    await waitFor(() => expect(result.current.items).toBeDefined());
    expect(fetchItems).toHaveBeenCalledTimes(2);
    expect(fetchItems.mock.calls[1][1]).toBe(1);
    expect(result.current.items).toHaveLength(total - 1);
    expect(result.current.truncated).toBe(false);
  });

  it('makes a single request when everything fits in one page', async () => {
    fetchItems.mockResolvedValue(page(0, 3, 3));
    const { result } = renderHook(() => useItemCatalog());
    await waitFor(() => expect(result.current.items).toHaveLength(3));
    expect(fetchItems).toHaveBeenCalledTimes(1);
    expect(result.current.truncated).toBe(false);
  });
});
