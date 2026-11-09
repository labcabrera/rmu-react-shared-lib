import { Page } from '../api/api';

/** The page size limit of the APIs. */
export const API_PAGE_SIZE = 100;

export type PageFetcher<T> = (rsql: string, page: number, size: number) => Promise<Page<T>>;

/** Every match of an RSQL query, page after page, for the lists that cannot be cut at the API limit. */
export const fetchAllPages = async <T>(fetcher: PageFetcher<T>, rsql: string): Promise<T[]> => {
  const first = await fetcher(rsql, 0, API_PAGE_SIZE);
  const others = await Promise.all(
    Array.from({ length: Math.max(0, first.pagination.totalPages - 1) }, (_, index) =>
      fetcher(rsql, index + 1, API_PAGE_SIZE)
    )
  );
  return [first, ...others].flatMap((page) => page.content);
};

/** Like `fetchAllPages`, for the callers that read a page: everything arrives as one. */
export const fetchFullPage = async <T>(fetcher: PageFetcher<T>, rsql: string): Promise<Page<T>> => {
  const content = await fetchAllPages(fetcher, rsql);
  return { content, pagination: { page: 0, size: content.length, totalElements: content.length, totalPages: 1 } };
};
