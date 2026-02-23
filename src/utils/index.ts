/**
 * Utilities Index
 * Exports all utility helpers as individual named exports (tree-shakeable)
 */

// Currency utilities
export {
  toApi as currencyToApi,
  fromApi as currencyFromApi,
  format as formatCurrency,
  formatFromApi as formatCurrencyFromApi,
} from './currency.js';

// Date utilities
export {
  toApi as dateToApi,
  toApiWithTime,
  toApiWithLocalTime,
  fromApi as dateFromApi,
  isValid as isValidDate,
  today,
  daysFromNow,
  weeksFromNow,
  monthsFromNow,
  range as dateRange,
} from './dates.js';

// Pagination utilities
export {
  hasMorePages,
  getTotalPages,
  iteratePages,
  iteratePageResponses,
  fetchAllPages,
  createPaginator,
} from './pagination.js';

export type {
  EnhancedPaginatedResponse,
  PaginationOptions,
  PageFetcher,
  DataExtractor,
} from './pagination.js';
