import { describe, it, expect, vi } from 'vitest';
import {
  hasMorePages,
  getTotalPages,
  iteratePages,
  iteratePageResponses,
  fetchAllPages,
  createPaginator,
} from '../../src/utils/pagination.js';
import type { PaginatedResponse } from '../../src/types/index.js';

// Helper to create mock paginated responses
function createMockResponse<T>(
  data: T[],
  page: number,
  total: number,
  perPage: number = 10
): PaginatedResponse & { data: { items: T[] } } {
  return {
    total,
    count: data.length,
    page,
    per_page: perPage,
    data: { items: data },
  };
}

describe('pagination utilities', () => {
  describe('hasMorePages', () => {
    it('should return true when there are more pages', () => {
      const response: PaginatedResponse = {
        total: 100,
        count: 10,
        page: 0,
        per_page: 10,
      };
      expect(hasMorePages(response)).toBe(true);
    });

    it('should return false when on last page', () => {
      const response: PaginatedResponse = {
        total: 25,
        count: 5,
        page: 2,
        per_page: 10,
      };
      expect(hasMorePages(response)).toBe(false);
    });

    it('should return false when only one page exists', () => {
      const response: PaginatedResponse = {
        total: 5,
        count: 5,
        page: 0,
        per_page: 10,
      };
      expect(hasMorePages(response)).toBe(false);
    });

    it('should handle empty results', () => {
      const response: PaginatedResponse = {
        total: 0,
        count: 0,
        page: 0,
        per_page: 10,
      };
      expect(hasMorePages(response)).toBe(false);
    });
  });

  describe('getTotalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(getTotalPages({ total: 100, count: 10, page: 0, per_page: 10 })).toBe(10);
      expect(getTotalPages({ total: 25, count: 10, page: 0, per_page: 10 })).toBe(3);
      expect(getTotalPages({ total: 5, count: 5, page: 0, per_page: 10 })).toBe(1);
      expect(getTotalPages({ total: 0, count: 0, page: 0, per_page: 10 })).toBe(0);
    });
  });

  describe('iteratePages', () => {
    it('should iterate through all items across pages', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2, 3], 0, 8, 3))
        .mockResolvedValueOnce(createMockResponse([4, 5, 6], 1, 8, 3))
        .mockResolvedValueOnce(createMockResponse([7, 8], 2, 8, 3));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const items: number[] = [];
      for await (const item of iteratePages(fetchPage, extractData)) {
        items.push(item);
      }

      expect(items).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(fetchPage).toHaveBeenCalledTimes(3);
    });

    it('should handle single page', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2, 3], 0, 3, 10));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const items: number[] = [];
      for await (const item of iteratePages(fetchPage, extractData)) {
        items.push(item);
      }

      expect(items).toEqual([1, 2, 3]);
      expect(fetchPage).toHaveBeenCalledTimes(1);
    });

    it('should respect maxPages option', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 0, 100, 2))
        .mockResolvedValueOnce(createMockResponse([3, 4], 1, 100, 2));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const items: number[] = [];
      for await (const item of iteratePages(fetchPage, extractData, { maxPages: 2 })) {
        items.push(item);
      }

      expect(items).toEqual([1, 2, 3, 4]);
      expect(fetchPage).toHaveBeenCalledTimes(2);
    });

    it('should respect startPage option', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([3, 4], 1, 8, 2))
        .mockResolvedValueOnce(createMockResponse([5, 6], 2, 8, 2));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const items: number[] = [];
      for await (const item of iteratePages(fetchPage, extractData, { startPage: 1, maxPages: 2 })) {
        items.push(item);
      }

      expect(items).toEqual([3, 4, 5, 6]);
      expect(fetchPage).toHaveBeenCalledWith(1);
    });
  });

  describe('iteratePageResponses', () => {
    it('should iterate through page responses', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 0, 4, 2))
        .mockResolvedValueOnce(createMockResponse([3, 4], 1, 4, 2));

      const pages: number[] = [];
      for await (const response of iteratePageResponses(fetchPage)) {
        pages.push(response.page);
      }

      expect(pages).toEqual([0, 1]);
      expect(fetchPage).toHaveBeenCalledTimes(2);
    });

    it('should respect options', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 2, 100, 2));

      const pages: number[] = [];
      for await (const response of iteratePageResponses(fetchPage, { startPage: 2, maxPages: 1 })) {
        pages.push(response.page);
      }

      expect(pages).toEqual([2]);
      expect(fetchPage).toHaveBeenCalledTimes(1);
    });
  });

  describe('fetchAllPages', () => {
    it('should fetch all items at once', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2, 3], 0, 6, 3))
        .mockResolvedValueOnce(createMockResponse([4, 5, 6], 1, 6, 3));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const items = await fetchAllPages(fetchPage, extractData);

      expect(items).toEqual([1, 2, 3, 4, 5, 6]);
    });
  });

  describe('createPaginator', () => {
    it('should create a paginator with iterate method', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 0, 2, 2));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const paginator = createPaginator(fetchPage, extractData);

      const items: number[] = [];
      for await (const item of paginator.iterate()) {
        items.push(item);
      }

      expect(items).toEqual([1, 2]);
    });

    it('should create a paginator with iteratePages method', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 0, 2, 2));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const paginator = createPaginator(fetchPage, extractData);

      const pages: number[] = [];
      for await (const response of paginator.iteratePages()) {
        pages.push(response.page);
      }

      expect(pages).toEqual([0]);
    });

    it('should create a paginator with fetchAll method', async () => {
      const fetchPage = vi.fn()
        .mockResolvedValueOnce(createMockResponse([1, 2], 0, 2, 2));

      const extractData = (response: { data: { items: number[] } }) => response.data.items;

      const paginator = createPaginator(fetchPage, extractData);

      const items = await paginator.fetchAll();

      expect(items).toEqual([1, 2]);
    });
  });

});
