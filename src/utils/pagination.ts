/**
 * Pagination Utilities
 * Helpers for working with paginated API responses and async iteration
 *
 * @example
 * ```typescript
 * import { Freelo } from '@freelo/js-sdk';
 * import { createPaginator, iteratePages } from '@freelo/js-sdk';
 *
 * const freelo = new Freelo({ email, apiKey, userAgent });
 *
 * // Using async iterator to iterate through all projects
 * for await (const project of iteratePages(
 *   (page) => freelo.projects.listAll({ page }),
 *   (response) => response.data.projects
 * )) {
 *   console.log(project.name);
 * }
 * ```
 */

import type { PaginatedResponse } from '../types/index.js';

/**
 * Enhanced paginated response with convenience properties
 */
export interface EnhancedPaginatedResponse<T> extends PaginatedResponse {
  /** The data items */
  data: T[];
  /** Whether there are more pages available */
  hasMore: boolean;
}

/**
 * Options for pagination
 */
export interface PaginationOptions {
  /** Starting page (default: 0) */
  startPage?: number;
  /** Maximum number of pages to fetch (default: unlimited) */
  maxPages?: number;
}

/**
 * Page fetcher function type
 */
export type PageFetcher<TResponse> = (page: number) => Promise<TResponse>;

/**
 * Data extractor function type
 */
export type DataExtractor<TResponse, TItem> = (response: TResponse) => TItem[];

/**
 * Check if a paginated response has more pages
 * @param response - The paginated response
 * @returns True if there are more pages
 */
export function hasMorePages(response: PaginatedResponse): boolean {
  const currentCount = response.page * response.per_page + response.count;
  return currentCount < response.total;
}

/**
 * Calculate the total number of pages
 * @param response - The paginated response
 * @returns Total number of pages
 */
export function getTotalPages(response: PaginatedResponse): number {
  return Math.ceil(response.total / response.per_page);
}

/**
 * Create an async iterator that yields items from all pages
 * @param fetchPage - Function that fetches a page
 * @param extractData - Function that extracts the data array from the response
 * @param options - Pagination options
 * @returns Async generator that yields individual items
 *
 * @example
 * ```typescript
 * // Iterate through all tasks
 * for await (const task of iteratePages(
 *   (page) => freelo.tasks.list({ page }),
 *   (response) => response.data.tasks
 * )) {
 *   console.log(task.name);
 * }
 * ```
 */
export async function* iteratePages<TResponse extends PaginatedResponse, TItem>(
  fetchPage: PageFetcher<TResponse>,
  extractData: DataExtractor<TResponse, TItem>,
  options?: PaginationOptions
): AsyncGenerator<TItem, void, undefined> {
  let page = options?.startPage ?? 0;
  let pagesProcessed = 0;
  const maxPages = options?.maxPages ?? Infinity;

  while (pagesProcessed < maxPages) {
    const response = await fetchPage(page);
    const items = extractData(response);

    for (const item of items) {
      yield item;
    }

    pagesProcessed++;

    if (!hasMorePages(response)) {
      break;
    }

    page++;
  }
}

/**
 * Create an async iterator that yields page responses
 * @param fetchPage - Function that fetches a page
 * @param options - Pagination options
 * @returns Async generator that yields page responses
 *
 * @example
 * ```typescript
 * // Process pages individually
 * for await (const pageResponse of iteratePageResponses(
 *   (page) => freelo.projects.listAll({ page })
 * )) {
 *   console.log(`Processing page ${pageResponse.page} of ${getTotalPages(pageResponse)}`);
 *   for (const project of pageResponse.data.projects) {
 *     console.log(project.name);
 *   }
 * }
 * ```
 */
export async function* iteratePageResponses<TResponse extends PaginatedResponse>(
  fetchPage: PageFetcher<TResponse>,
  options?: PaginationOptions
): AsyncGenerator<TResponse, void, undefined> {
  let page = options?.startPage ?? 0;
  let pagesProcessed = 0;
  const maxPages = options?.maxPages ?? Infinity;

  while (pagesProcessed < maxPages) {
    const response = await fetchPage(page);
    yield response;

    pagesProcessed++;

    if (!hasMorePages(response)) {
      break;
    }

    page++;
  }
}

/**
 * Fetch all items from a paginated endpoint at once
 * @param fetchPage - Function that fetches a page
 * @param extractData - Function that extracts the data array from the response
 * @param options - Pagination options
 * @returns Promise resolving to array of all items
 *
 * @example
 * ```typescript
 * // Get all projects at once
 * const allProjects = await fetchAllPages(
 *   (page) => freelo.projects.listAll({ page }),
 *   (response) => response.data.projects
 * );
 * ```
 */
export async function fetchAllPages<TResponse extends PaginatedResponse, TItem>(
  fetchPage: PageFetcher<TResponse>,
  extractData: DataExtractor<TResponse, TItem>,
  options?: PaginationOptions
): Promise<TItem[]> {
  const items: TItem[] = [];

  for await (const item of iteratePages(fetchPage, extractData, options)) {
    items.push(item);
  }

  return items;
}

/**
 * Create a paginator object for a specific resource
 * @param fetchPage - Function that fetches a page
 * @param extractData - Function that extracts the data array from the response
 * @returns Paginator object with iterate() and fetchAll() methods
 *
 * @example
 * ```typescript
 * const projectsPaginator = createPaginator(
 *   (page) => freelo.projects.listAll({ page }),
 *   (response) => response.data.projects
 * );
 *
 * // Use as async iterator
 * for await (const project of projectsPaginator.iterate()) {
 *   console.log(project.name);
 * }
 *
 * // Or fetch all at once
 * const allProjects = await projectsPaginator.fetchAll();
 * ```
 */
export function createPaginator<TResponse extends PaginatedResponse, TItem>(
  fetchPage: PageFetcher<TResponse>,
  extractData: DataExtractor<TResponse, TItem>
) {
  return {
    /**
     * Iterate through all items
     */
    iterate(options?: PaginationOptions): AsyncGenerator<TItem, void, undefined> {
      return iteratePages(fetchPage, extractData, options);
    },

    /**
     * Iterate through page responses
     */
    iteratePages(options?: PaginationOptions): AsyncGenerator<TResponse, void, undefined> {
      return iteratePageResponses(fetchPage, options);
    },

    /**
     * Fetch all items at once
     */
    fetchAll(options?: PaginationOptions): Promise<TItem[]> {
      return fetchAllPages(fetchPage, extractData, options);
    },
  };
}

/**
 * Pagination utility namespace
 */
export const pagination = {
  hasMorePages,
  getTotalPages,
  iteratePages,
  iteratePageResponses,
  fetchAllPages,
  createPaginator,
};

export default pagination;
