# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
