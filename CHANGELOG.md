# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.2.0...js-sdk-v3.0.0) (2026-04-22)


### ⚠ BREAKING CHANGES

* rewrite SDK v2.0.0 with Hey API auto-generated client

### Added

* add dynamic credential support with setCredentials and withCredentials ([33cdfa3](https://github.com/freeloapp/js-sdk/commit/33cdfa35d422809c5cb1974784e1dcc051a024b1))
* add low-level call() method for arbitrary API endpoints ([79cf737](https://github.com/freeloapp/js-sdk/commit/79cf73792863d553f9956c03a88d2605d55f3666))
* add low-level call() method for arbitrary API endpoints ([de493c6](https://github.com/freeloapp/js-sdk/commit/de493c61eb8ad4168e67dd0d5562e24c896f50e7))
* add main Freelo client class with unified API access ([f41b5ca](https://github.com/freeloapp/js-sdk/commit/f41b5cae9d6ecaa1bacc68816662ed654253a03f))
* add OAuth 2.1 authentication with PKCE and auto-refresh ([f6d9cc6](https://github.com/freeloapp/js-sdk/commit/f6d9cc6bd1932e93c11ad52f86b30a336b0f5257))
* add TypeScript type definitions for Freelo API ([22349f1](https://github.com/freeloapp/js-sdk/commit/22349f16f8be8baaa2b4e06659907d94a4bebf02))
* add utility functions for pagination, dates, and currency ([7379816](https://github.com/freeloapp/js-sdk/commit/7379816b8b4b5b9bd713929974ed93f849ae7e76))
* implement API resource classes for all Freelo endpoints ([ba6b1b8](https://github.com/freeloapp/js-sdk/commit/ba6b1b8c5b89afe86535e159a0df15304625b59f))
* implement HTTP client with rate limiting support ([6211905](https://github.com/freeloapp/js-sdk/commit/62119058db139e5422f9978929ac3eb05d9d1f56))
* rewrite SDK v2.0.0 with Hey API auto-generated client ([ed47bc1](https://github.com/freeloapp/js-sdk/commit/ed47bc1c2ad1a6e5ef4574fd69d2eacb26288c61))
* support multiple auth methods via discriminated union ([f28f752](https://github.com/freeloapp/js-sdk/commit/f28f752c3bdfd28f5e4f20283385533f50f4b83a))


### Fixed

* update repository URLs from GitLab to GitHub ([7de77cd](https://github.com/freeloapp/js-sdk/commit/7de77cde68c8ce346226b73fbf3adcffb29c2b80))
* use shields.io for npm version badge ([03c0467](https://github.com/freeloapp/js-sdk/commit/03c0467b5f82fef030f1237a607283a4be389c56))


### Changed

* add Freelo API OpenAPI specification ([ebccab7](https://github.com/freeloapp/js-sdk/commit/ebccab72922b85a959a47068d3029a6a0541e294))
* add README, CHANGELOG, and LICENSE ([7a80c7d](https://github.com/freeloapp/js-sdk/commit/7a80c7da112a357548d3e12ee382a3a63a1d6924))
* add usage examples for various frameworks ([18dec6f](https://github.com/freeloapp/js-sdk/commit/18dec6f25ffe57688290b0d53ef60a7d7ed23eac))
* add v2.2.0 changelog entry ([0a9931f](https://github.com/freeloapp/js-sdk/commit/0a9931fda3bc003db73ffcaa56ed61ff70d8d6d7))

## [2.2.0] - 2026-04-22

### Added

- `assignTaskToProject` endpoint for assigning a task to a project
- `removeTaskFromProject` endpoint for removing a task from a project
- `getTaskRelations` endpoint for fetching a task's relations
- `findTaskRelationsBulk` endpoint for bulk task-relation lookup
- `TaskRelation` type
- Rich JSDoc descriptions on generated SDK functions (use cases, behavior notes) — sourced from the OpenAPI spec and surfaced in `.d.ts` for IDE hovers and LLM tooling

---

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
