/**
 * Resources Index
 * Exports all resource classes
 */

export { ProjectsResource } from './projects.js';
export type {
  ProjectsPaginatedResponse,
  InvitedProjectsPaginatedResponse,
  ArchivedProjectsPaginatedResponse,
  TemplateProjectsPaginatedResponse,
  WorkersPaginatedResponse,
} from './projects.js';

export { TasklistsResource } from './tasklists.js';
export type { TasklistsPaginatedResponse } from './tasklists.js';

export { TasksResource } from './tasks.js';
export type { TasksPaginatedResponse, FinishedTasksPaginatedResponse } from './tasks.js';

export { SubtasksResource } from './subtasks.js';
export type { SubtasksPaginatedResponse } from './subtasks.js';

export { CommentsResource } from './comments.js';
export type { CommentsPaginatedResponse } from './comments.js';

export { TimeTrackingResource } from './timetracking.js';
export type { TimeTrackingStartResponse } from './timetracking.js';

export { WorkReportsResource } from './workreports.js';
export type { WorkReportsPaginatedResponse } from './workreports.js';

export { UsersResource } from './users.js';
export type {
  UsersPaginatedResponse,
  InviteUsersResponse,
  OutOfOfficeResponse,
} from './users.js';

export { FilesResource } from './files.js';
export type { FilesPaginatedResponse } from './files.js';

export { SearchResource } from './search.js';
export type { SearchPaginatedResponse } from './search.js';

export { NotificationsResource } from './notifications.js';
export type { NotificationsPaginatedResponse } from './notifications.js';

export { EventsResource } from './events.js';
export type { EventsPaginatedResponse } from './events.js';

export { CustomFieldsResource } from './customfields.js';
export type {
  CustomFieldTypesResponse,
  CustomFieldsForProjectResponse,
  CreateCustomFieldResponse,
  CustomFieldValueResponse,
  CustomFieldEnumValueResponse,
  CustomFieldEnumOptionsResponse,
  CreatedEnumOptionResponse,
} from './customfields.js';

export { NotesResource } from './notes.js';

export { InvoicingResource } from './invoicing.js';
export type { IssuedInvoicesPaginatedResponse } from './invoicing.js';

export { StatesResource } from './states.js';
