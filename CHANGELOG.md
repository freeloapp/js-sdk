# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.6.1](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.6.0...js-sdk-v2.6.1) (2026-07-10)


### Fixed

* regenerate SDK from updated OpenAPI spec ([81ec19f](https://github.com/freeloapp/js-sdk/commit/81ec19f2c41012e6b8480ec9c73baaebc9941174))
* regenerate SDK from updated OpenAPI spec ([db0ed54](https://github.com/freeloapp/js-sdk/commit/db0ed541560ffaebae914021c4e43992d6c7d83d))

## [2.6.0](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.5.0...js-sdk-v2.6.0) (2026-06-16)


### Added

* regenerate SDK from latest production OpenAPI spec ([40b9dc0](https://github.com/freeloapp/js-sdk/commit/40b9dc0ea03e99bca27f797bd30bd89e6e54dfdb))
* regenerate SDK from latest production OpenAPI spec ([21718e8](https://github.com/freeloapp/js-sdk/commit/21718e8dfe68d4a1d5f020a7fece8b3dac741b18))


### Fixed

* regenerate SDK from updated OpenAPI spec ([8d04166](https://github.com/freeloapp/js-sdk/commit/8d04166f162490cb790d4fa96bceb63556157fd5))
* regenerate SDK from updated OpenAPI spec ([5fbe8b1](https://github.com/freeloapp/js-sdk/commit/5fbe8b1ffe6c7923b44025e29d7e856c636f0c3f))

## [2.5.0](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.4.0...js-sdk-v2.5.0) (2026-06-08)


### Added

* regenerate SDK from latest production OpenAPI spec ([2797f2f](https://github.com/freeloapp/js-sdk/commit/2797f2ff74690d70a2309e746ac240f52bd52811))


### Fixed

* regenerate SDK from updated OpenAPI spec ([f53fdc1](https://github.com/freeloapp/js-sdk/commit/f53fdc1e94a11ef1ad7d48a1a6e07fe753470439))
* regenerate SDK from updated OpenAPI spec ([31bcf2f](https://github.com/freeloapp/js-sdk/commit/31bcf2f330ee7d19a4b388fa40541c144b290e50))

## [2.4.0](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.3.2...js-sdk-v2.4.0) (2026-05-27)


### Added

* add custom default headers via FreeloConfig.headers ([78ea0b7](https://github.com/freeloapp/js-sdk/commit/78ea0b785b7d451e7af8f30f995891f29e6ff906))


### Fixed

* regenerate SDK from updated OpenAPI spec ([8faf852](https://github.com/freeloapp/js-sdk/commit/8faf85267d1acd407d74888c4888038647f7286e))
* regenerate SDK from updated OpenAPI spec ([acd9dda](https://github.com/freeloapp/js-sdk/commit/acd9ddaabb0c505a8f78a537b0265089a2439f82))

## [2.3.2](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.3.1...js-sdk-v2.3.2) (2026-05-27)


### Fixed

* regenerate SDK from updated OpenAPI spec ([8faf852](https://github.com/freeloapp/js-sdk/commit/8faf85267d1acd407d74888c4888038647f7286e))

## [2.3.1](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.3.0...js-sdk-v2.3.1) (2026-05-11)


### Fixed

* regenerate SDK from updated OpenAPI spec ([acd9dda](https://github.com/freeloapp/js-sdk/commit/acd9ddaabb0c505a8f78a537b0265089a2439f82))

## [2.3.0](https://github.com/freeloapp/js-sdk/compare/js-sdk-v2.2.0...js-sdk-v2.3.0) (2026-04-24)


### Added

* add custom default headers via FreeloConfig.headers ([78ea0b7](https://github.com/freeloapp/js-sdk/commit/78ea0b785b7d451e7af8f30f995891f29e6ff906))

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
