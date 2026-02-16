/**
 * Freelo SDK - Official JavaScript/TypeScript SDK for Freelo.io API
 *
 * @example
 * ```typescript
 * import { Freelo } from '@freeloapp/js-sdk';
 *
 * const freelo = new Freelo({
 *   email: 'your@email.tld',
 *   apiKey: 'your-api-key',
 *   userAgent: 'YourApp/1.0 (contact@yourapp.com)'
 * });
 *
 * // Get all projects
 * const projects = await freelo.projects.list();
 *
 * // Create a task
 * const task = await freelo.tasks.create(tasklistId, {
 *   name: 'New Task',
 *   worker: userId
 * });
 * ```
 *
 * @packageDocumentation
 */

/**
 * SDK version
 */
export const VERSION = '1.0.0';

// Main client
export { Freelo, type FreeloConfig, type FreeloLazyConfig, type FreeloCredentials } from './client.js';
export { default } from './client.js';

// HTTP client and errors
export { HttpClient, FreeloApiError, RateLimitError } from './http.js';
export type { HttpClientConfig, HttpClientCredentials, ApiError, RequestOptions, RateLimitConfig, FileUploadResponse } from './http.js';

// All types
export * from './types/index.js';

// Utilities
export {
  // Currency utilities
  currency,
  currencyToApi,
  currencyFromApi,
  formatCurrency,
  formatCurrencyFromApi,
  // Date utilities
  dates,
  dateToApi,
  toApiWithTime,
  toApiWithLocalTime,
  dateFromApi,
  isValidDate,
  today,
  daysFromNow,
  weeksFromNow,
  monthsFromNow,
  dateRange,
  // Pagination utilities
  pagination,
  hasMorePages,
  getTotalPages,
  iteratePages,
  iteratePageResponses,
  fetchAllPages,
  createPaginator,
} from './utils/index.js';

export type {
  EnhancedPaginatedResponse,
  PaginationOptions,
  PageFetcher,
  DataExtractor,
} from './utils/index.js';

// Resource classes and their response types
export {
  ProjectsResource,
  TasklistsResource,
  TasksResource,
  SubtasksResource,
  CommentsResource,
  TimeTrackingResource,
  WorkReportsResource,
  UsersResource,
  FilesResource,
  SearchResource,
  NotificationsResource,
  EventsResource,
  CustomFieldsResource,
  NotesResource,
  InvoicingResource,
  StatesResource,
} from './resources/index.js';

export type {
  // Projects
  ProjectsPaginatedResponse,
  InvitedProjectsPaginatedResponse,
  ArchivedProjectsPaginatedResponse,
  TemplateProjectsPaginatedResponse,
  WorkersPaginatedResponse,
  // Tasklists
  TasklistsPaginatedResponse,
  // Tasks
  TasksPaginatedResponse,
  FinishedTasksPaginatedResponse,
  // Subtasks
  SubtasksPaginatedResponse,
  // Comments
  CommentsPaginatedResponse,
  // Time Tracking
  TimeTrackingStartResponse,
  // Work Reports
  WorkReportsPaginatedResponse,
  // Users
  UsersPaginatedResponse,
  InviteUsersResponse,
  OutOfOfficeResponse,
  // Files
  FilesPaginatedResponse,
  // Search
  SearchPaginatedResponse,
  // Notifications
  NotificationsPaginatedResponse,
  // Events
  EventsPaginatedResponse,
  // Custom Fields
  CustomFieldTypesResponse,
  CustomFieldsForProjectResponse,
  CreateCustomFieldResponse,
  CustomFieldValueResponse,
  CustomFieldEnumValueResponse,
  CustomFieldEnumOptionsResponse,
  CreatedEnumOptionResponse,
  // Invoicing
  IssuedInvoicesPaginatedResponse,
} from './resources/index.js';
