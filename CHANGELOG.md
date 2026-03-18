# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2026-03-18

### Added

- `getUsersMe` endpoint for fetching current user info
- `getTimeTrackingStatus` endpoint for time tracking status
- `getIssuedInvoiceReportsJson` endpoint for issued invoice reports
- `ErrorResponse`, `TaskBasic`, `TaskWork`, `WorkReportExtended` types

### Changed

- `TaskDetail.tracking_users` field type updated
- Error responses on time tracking endpoints
- `with_labels[]` filter parameter
- `with_own_taskless` filter parameter
- `WorkReportFull` nullable fields

### Fixed

- npm version badge (switched to shields.io)
- Repository URLs (GitLab → GitHub)

### Removed

- `.gitlab-ci.yml` (replaced by GitHub Actions)

---

## [2.0.0] - 2026-02-23

### Breaking Changes

- **Class-based API replaced with function-based API**: `new Freelo()` is now `createFreelo()`
- **Resource methods replaced with tree-shakeable functions**: `freelo.projects.list()` is now `getProjects()`
- **Response format changed**: SDK functions return `{ data, error, request, response }` instead of raw data
- **Removed**: `Freelo`, `HttpClient`, `FreeloApiError`, `RateLimitError` classes
- **Removed**: All resource classes (`ProjectsResource`, `TasksResource`, etc.)
- **Removed**: `setCredentials()`, `withCredentials()`, `call()` methods — use `createFreelo()` per-client instead

### Added

- Auto-generated SDK from [OpenAPI spec](https://api.freelo.io/docs/v1/freelo-api.yaml) using [Hey API](https://heyapi.dev/)
- 101 tree-shakeable SDK functions covering all API endpoints
- `createFreelo()` configuration function with Basic Auth, logging, and rate limit handling
- Per-request client support for multi-tenant scenarios via `{ client }` parameter
- Error utility functions: `isFreeloError()`, `isRateLimited()`, `isUnauthorized()`, `isNotFound()`
- CI/CD pipeline for automated OpenAPI spec checking (GitHub Actions + GitLab CI)
- Smoke test suite for manual API verification

### Changed

- Pagination utilities updated to work with generated SDK response format
- Removed namespace objects (`currency`, `dates`, `pagination`) — all exports are now individual functions
- Coverage thresholds exclude generated code in `src/generated/`

---

## [1.0.0] - 2024-XX-XX

### Added

- Initial release
- Full TypeScript support with comprehensive type definitions
- Zero runtime dependencies (uses native fetch)
- Support for Node.js 18+, browsers, and all major frameworks

#### API Resources

- **Projects**: List, get, create, delete, archive, activate, manage workers
- **Tasklists**: List, get, create, update, delete, move, budgets
- **Tasks**: Full CRUD, finish/activate, labels, description, reminders, time estimates
- **Subtasks**: Full CRUD, finish/activate
- **Comments**: List, get, create, update, delete
- **Time Tracking**: Start, stop, get running tracker, edit
- **Work Reports**: List, get, create, update, delete
- **Users**: List, get, me, invite, manage workers, out-of-office
- **Files**: List, get, upload, download, delete
- **Search**: Full-text search with filters
- **Notifications**: List, count, mark as read
- **Events**: List with date and type filters
- **Custom Fields**: Types, create, values, enum options
- **Notes**: List, get, create, update, delete
- **Invoicing**: List, get, mark/unmark as invoiced
- **States**: Get task state definitions

#### Utilities

- Date utilities (dateToApi, dateFromApi, today, daysFromNow, etc.)
- Currency utilities (currencyToApi, currencyFromApi, formatCurrency)
- Pagination utilities (fetchAllPages, iteratePages, createPaginator)

#### Error Handling

- FreeloApiError with status-based helper properties
- RateLimitError for 429 responses
- Detailed validation error support

#### Examples

- Basic usage examples
- React integration with hooks
- Vue integration with composables
- Next.js API routes
- Node.js CLI scripts
- Advanced patterns (error handling, pagination, bulk operations)

#### Testing

- Comprehensive unit test suite
- E2E test support
- Coverage reporting
