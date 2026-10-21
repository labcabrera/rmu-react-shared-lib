import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Page } from '../api/api';
import { ApiError } from './api-error';
import { useDebounce } from './useDebounce';
import { useEntity } from './useEntity';
import { usePagedQuery } from './usePagedQuery';

const page = (content: string[], totalPages = 3): Page<string> => ({
  content,
  pagination: { page: 0, size: content.length, totalElements: totalPages * content.length, totalPages },
});

describe('usePagedQuery', () => {
  it('passes the sort to the fetcher and goes back to the first page when it changes', async () => {
    const fetcher = vi.fn().mockResolvedValue(page(['a']));
    const { result, rerender } = renderHook(({ sort }) => usePagedQuery({ fetcher, sort }), {
      initialProps: { sort: 'name' },
    });
    await waitFor(() => expect(fetcher).toHaveBeenCalledWith('', 0, 24, 'name'));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('', 2, 24, 'name'));
    rerender({ sort: '-createdAt' });
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('', 0, 24, '-createdAt'));
  });

  it('fetches the first page and exposes the pagination', async () => {
    const fetcher = vi.fn().mockResolvedValue(page(['a', 'b']));
    const { result } = renderHook(() => usePagedQuery({ fetcher, pageSize: 2 }));
    await waitFor(() => expect(result.current.items).toEqual(['a', 'b']));
    expect(fetcher).toHaveBeenCalledWith('', 0, 2, undefined);
    expect(result.current.totalPages).toBe(3);
    expect(result.current.totalElements).toBe(6);
  });

  it('refetches on page, page size and refresh', async () => {
    const fetcher = vi.fn().mockResolvedValue(page(['a']));
    const { result } = renderHook(() => usePagedQuery({ fetcher }));
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
    act(() => result.current.setPage(2));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('', 2, 24, undefined));
    act(() => result.current.setPageSize(48));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('', 0, 48, undefined));
    act(() => result.current.refresh());
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(4));
  });

  it('goes back to the first page when the filter changes', async () => {
    const fetcher = vi.fn().mockResolvedValue(page(['a']));
    const { result, rerender } = renderHook(({ rsql }) => usePagedQuery({ fetcher, rsql }), {
      initialProps: { rsql: '' },
    });
    act(() => result.current.setPage(2));
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('', 2, 24, undefined));
    rerender({ rsql: 'name=re=sword' });
    await waitFor(() => expect(fetcher).toHaveBeenLastCalledWith('name=re=sword', 0, 24, undefined));
    expect(result.current.page).toBe(0);
  });

  it('reports errors and does not fetch while disabled', async () => {
    const onError = vi.fn();
    const failing = vi.fn().mockRejectedValue(new ApiError(500, '', '', '/x'));
    const { result } = renderHook(() => usePagedQuery({ fetcher: failing, onError }));
    await waitFor(() => expect(onError).toHaveBeenCalled());
    expect(result.current.error).toBeInstanceOf(ApiError);

    const idle = vi.fn();
    renderHook(() => usePagedQuery({ fetcher: idle, enabled: false }));
    expect(idle).not.toHaveBeenCalled();
  });
});

describe('useEntity', () => {
  it('uses the initial entity without fetching', () => {
    const fetcher = vi.fn();
    const { result } = renderHook(() => useEntity('1', fetcher, { initial: { id: '1' } }));
    expect(result.current.entity).toEqual({ id: '1' });
    expect(result.current.loading).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('fetches by id and refetches on refresh', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: '1' });
    const { result } = renderHook(() => useEntity('1', fetcher));
    await waitFor(() => expect(result.current.entity).toEqual({ id: '1' }));
    act(() => result.current.refresh());
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });

  it('flags a 404 as not found', async () => {
    const fetcher = vi.fn().mockRejectedValue(new ApiError(404, 'Not Found', '', '/x'));
    const { result } = renderHook(() => useEntity('missing', fetcher));
    await waitFor(() => expect(result.current.notFound).toBe(true));
    expect(result.current.entity).toBeUndefined();
  });
});

describe('useDebounce', () => {
  it('returns the value once it stops changing', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), { initialProps: { value: 'a' } });
    rerender({ value: 'ab' });
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('ab');
    vi.useRealTimers();
  });
});
