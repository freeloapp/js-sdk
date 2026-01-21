/**
 * Search Resource
 * Handles search API operations
 */

import { HttpClient } from '../http.js';
import type {
  SearchResult,
  PaginatedResponse,
  SearchInput,
} from '../types/index.js';

/** Search paginated response */
export interface SearchPaginatedResponse extends PaginatedResponse {
  data: {
    items: SearchResult[];
  };
}

/**
 * Search Resource class
 */
export class SearchResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Search using Elasticsearch
   * @param input - Search input parameters
   * @returns Paginated response with search results
   */
  async search(input: SearchInput): Promise<SearchPaginatedResponse> {
    return this.http.post<SearchPaginatedResponse>('/search', input);
  }
}
