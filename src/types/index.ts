/**
 * Freelo SDK Type Definitions
 * Based on OpenAPI specification
 */

// ==================== ENUMS ====================

/** Supported currencies */
export type CurrencyCode = 'CZK' | 'EUR' | 'USD';

/** State values for entities */
export type StateType = 'active' | 'archived' | 'finished' | 'deleted' | 'template';

/** Task priority levels */
export type PriorityEnum = 'h' | 'm' | 'l';

/** Order direction */
export type OrderDirection = 'asc' | 'desc';

/** Project order by fields */
export type ProjectOrderBy = 'name' | 'date_add' | 'date_edited_at';

/** Comment type filter */
export type CommentType = 'all' | 'task' | 'document' | 'file' | 'link';

/** Comment order by fields */
export type CommentOrderBy = 'date_add' | 'date_edited_at';

/** Search entity types */
export type SearchEntityType = 'task' | 'subtask' | 'project' | 'tasklist' | 'file' | 'comment';

/** Search state IDs */
export type SearchStateId = 'active' | 'archived' | 'finished' | 'template' | 'not_template' | 'archived_finished' | 'archived_unfinished';

/** File item types */
export type FileItemType = 'directory' | 'link' | 'file' | 'document';

/** Custom field type UUIDs */
export const CustomFieldTypes = {
  TEXT: '2f7bfe3a-c950-470e-b910-95b4caf5dc4f',
  NUMBER: 'b1e56fa9-a97a-429b-8ab4-82bebe58933a',
  ENUM: 'f9729a8f-d340-40e4-b2c0-dc46c37e18ce',
} as const;

// ==================== COMMON TYPES ====================

/** Currency amount representation */
export interface Currency {
  /** Amount multiplied by 100 (e.g., "100025" = 1000.25) */
  amount: string;
  currency: CurrencyCode;
}

/** Entity state */
export interface State {
  id: number;
  state: StateType;
}

/** Basic user information */
export interface UserBasic {
  id: number;
  fullname: string;
}

/** Client/company information */
export interface Client {
  id: number;
  email?: string;
  name?: string;
  company?: string;
  company_id?: string;
  company_tax_id?: string;
  street?: string;
  town?: string;
  zip?: string;
}

/** Paginated response metadata */
export interface PaginatedResponse {
  total: number;
  count: number;
  page: number;
  per_page: number;
}

/** Success response */
export interface SuccessResponse {
  result: string;
}

// ==================== PROJECT TYPES ====================

/** Basic project information */
export interface ProjectBasic {
  id: number;
  name: string;
}

/** Tasklist basic information */
export interface TasklistBasic {
  id: number;
  name: string;
}

/** Project with tasklists */
export interface ProjectWithTasklists extends ProjectBasic {
  date_add: string;
  date_edited_at: string;
  tasklists: TasklistBasic[];
  client?: Client;
}

/** Full project information */
export interface ProjectFull extends ProjectBasic {
  date_add: string;
  date_edited_at: string;
  owner: UserBasic;
  state: State;
  minutes_budget: number | null;
  budget: Currency;
  real_minutes_spent: number;
  real_cost: Currency;
}

/** Project worker with hour rate */
export interface ProjectWorker extends UserBasic {
  hour_rate: {
    amount: number;
    currency: CurrencyCode;
    is_fixed: boolean;
  } | null;
}

/** Project detail task */
export interface ProjectDetailTask {
  id: number;
  name: string;
  due_date: string | null;
  due_date_end: string | null;
  worker?: UserBasic;
  parent_task_id: number | null;
}

/** Project detail tasklist */
export interface ProjectDetailTasklist {
  id: number;
  name: string;
  tasks: ProjectDetailTask[];
}

/** Project detail response */
export interface ProjectDetail extends ProjectFull {
  tasklists: ProjectDetailTasklist[];
  workers: ProjectWorker[];
}

/** Project label */
export interface ProjectLabel {
  id: number;
  name: string;
  color: string | null;
  is_private: boolean;
  users_id: number;
  usage_count: number;
  can_be_public: boolean;
  can_be_edited: boolean;
}

/** Pinned item */
export interface PinnedItem {
  id: number;
  link: string;
  title: string;
}

// ==================== TASKLIST TYPES ====================

/** Tasklist with budget */
export interface TasklistWithBudget extends TasklistBasic {
  budget: Currency;
}

/** Full tasklist information */
export interface TasklistFull extends TasklistBasic {
  date_add: string;
  date_edited_at: string;
  state: State;
  project: ProjectBasic & { state: State };
  real_minutes_spent: number;
  budget: Currency;
  real_cost: Currency;
}

/** Tasklist detail task */
export interface TasklistDetailTask {
  id: number;
  name: string;
  due_date: string | null;
  due_date_end: string | null;
  worker?: UserBasic;
  parent_task_id: number | null;
}

/** Tasklist detail response */
export interface TasklistDetail extends TasklistBasic {
  date_add: string;
  date_edited_at: string;
  tasks: TasklistDetailTask[];
}

// ==================== TASK TYPES ====================

/** Task label */
export interface TaskLabel {
  uuid: string;
  name: string;
  color: string;
}

/** Task label input for creating/adding labels */
export interface TaskLabelInput {
  name?: string;
  color?: string;
  uuid?: string;
}

/** Time estimate */
export interface TimeEstimate {
  minutes: number;
}

/** User time estimate */
export interface UserTimeEstimate {
  minutes: number;
  user: UserBasic;
}

/** Task summary */
export interface TaskSummary {
  id: number;
  name: string;
  date_add: string;
  date_edited_at: string;
  due_date: string | null;
  due_date_end: string | null;
  count_comments: number;
  count_subtasks: number;
  author: UserBasic;
  worker?: UserBasic;
  labels: TaskLabel[];
  parent_task_id: number | null;
  total_time_estimate?: TimeEstimate;
  users_time_estimates?: UserTimeEstimate[];
}

/** Full task information */
export interface TaskFull extends TaskSummary {
  state: State;
  project: ProjectBasic & { state: State };
  tasklist: TasklistBasic & { state: State };
  custom_fields?: CustomFieldWithValue[];
}

/** Task finished information */
export interface TaskFinished extends TaskSummary {
  date_finished: string;
  finished_by: UserBasic;
}

/** File basic information */
export interface FileBasic {
  id: number;
  uuid: string;
  filename: string;
  size: number;
}

/** Full file information */
export interface FileFull extends FileBasic {
  caption?: string;
  description?: string;
  date_add: string;
  date_edited_at: string;
  state: State;
}

/** Comment with files */
export interface CommentWithFiles {
  id: number;
  content: string;
  date_add: string;
  author: UserBasic;
  is_description: boolean;
  comments_reactions?: UserBasic[];
  files: FileFull[];
}

/** Custom field with value */
export interface CustomFieldWithValue {
  field_uuid: string;
  custom_fields_types_uuid: string;
  project_id: number;
  name: string;
  priority: number;
  field_date_add: string;
  value_uuid: string;
  value_author_id: number;
  value: string;
  value_date_add: string;
  value_date_edited_at: string | null;
}

/** Task detail response */
export interface TaskDetail {
  id: number;
  name: string;
  date_add: string;
  date_edited_at: string;
  due_date: string | null;
  due_date_end: string | null;
  date_finished: string | null;
  minutes: number;
  priority_enum: string;
  count_subtasks: number;
  parent_task_id: number | null;
  cost: Currency;
  author: UserBasic;
  worker?: UserBasic;
  state: State;
  comments: CommentWithFiles[];
  labels: TaskLabel[];
  project: ProjectBasic;
  tasklist: TasklistBasic;
  custom_fields?: CustomFieldWithValue[];
  total_time_estimate?: TimeEstimate;
  users_time_estimates?: UserTimeEstimate[];
}

/** Task created response */
export interface TaskCreated {
  id: number;
  name: string;
  date_add: string;
  due_date: string | null;
  due_date_end: string | null;
  worker?: UserBasic;
  priority_enum: string;
  labels: TaskLabel[];
  tracking_users: UserBasic[];
  subtasks: {
    id: number;
    task_id: number;
    name: string;
  }[];
}

// ==================== SUBTASK TYPES ====================

/** Subtask */
export interface Subtask {
  id: number;
  task_id: number | null;
  name: string;
  date_add: string;
  due_date: string | null;
  due_date_end: string | null;
  count_comments: number;
  count_subtasks: number;
  author: UserBasic;
  worker?: UserBasic;
  state: State;
  project: ProjectBasic & { state: State };
  tasklist: TasklistBasic & { state: State };
  labels: TaskLabel[];
}

// ==================== COMMENT TYPES ====================

/** Basic comment */
export interface Comment {
  id: number;
  content: string;
  date_add: string;
  files: FileBasic[];
}

/** Full comment information */
export interface CommentFull {
  id: number | null;
  uuid: string | null;
  content: string;
  date_add: string;
  date_edited_at: string;
  author: UserBasic;
  task?: {
    id: number;
    name: string;
  } | null;
  tasklist: TasklistBasic;
  project: ProjectBasic;
  document?: {
    uuid: string;
    name: string;
  } | null;
  link?: {
    uuid: string;
    name: string;
  } | null;
  file?: {
    uuid: string;
  } | null;
  files: FileFull[];
}

// ==================== WORK REPORT TYPES ====================

/** Work report */
export interface WorkReport {
  id: number;
  date_add: string;
  date_reported: string;
  note: string | null;
  minutes: number;
  cost: Currency;
  author: UserBasic;
  worker: UserBasic;
  task?: {
    id: number;
    name: string;
  } | null;
}

/** Full work report information */
export interface WorkReportFull extends WorkReport {
  date_edited_at: string;
  task?: {
    id: number;
    name: string;
    minutes: number;
    parent_task_id: number | null;
    cost: Currency;
    labels: TaskLabel[];
    total_time_estimate?: TimeEstimate;
    users_time_estimates?: UserTimeEstimate[];
  };
  tasklist: TasklistBasic;
  project: {
    id: number;
    name: string;
    labels: string[];
  };
}

// ==================== INVOICE TYPES ====================

/** Issued invoice */
export interface IssuedInvoice {
  id: number;
  date_add: string;
  note: string | null;
  currency: CurrencyCode;
  minutes: number;
  price: Currency;
  subject: {
    company_name: string;
    invoice_url: string;
  };
  inv_items: {
    id: number;
    name: string;
    minutes: number;
    price: Currency;
  }[];
}

/** Issued invoice detail */
export interface IssuedInvoiceDetail extends IssuedInvoice {
  inv_items: {
    id: number;
    name: string;
    minutes: number;
    price: Currency;
    reports: {
      id: number;
      project_name: string;
      tasklist_name: string;
      name: string;
      minutes: number;
      price: Currency;
    }[];
  }[];
}

// ==================== NOTIFICATION TYPES ====================

/** Notification */
export interface Notification {
  id: number;
  type: string;
  date_action: string;
  author: UserBasic;
  who: UserBasic;
  is_unread: boolean;
  is_new: boolean;
  task?: {
    id: number;
    name: string;
  } | null;
  tasklist: TasklistBasic;
  project: ProjectBasic;
  comment?: {
    id: number;
  } | null;
  document?: {
    id: number;
    name: string;
  } | null;
  file?: {
    uuid: string;
    filename: string;
    caption: string;
  } | null;
  more_comments: boolean;
  more_users: UserBasic[];
}

// ==================== EVENT TYPES ====================

/** Event */
export interface Event {
  id: number;
  date_action: string;
  type: string;
  author: UserBasic;
  who: UserBasic;
  comment?: {
    id: number;
  } | null;
  task?: {
    id: number;
    name: string;
  } | null;
  task_check?: {
    id: number;
    name: string;
  } | null;
  tasklist: TasklistBasic;
  project: ProjectBasic;
  document?: {
    id: number;
    name: string;
  } | null;
  file?: {
    id: number;
    uuid: string;
    filename: string;
    caption: string;
  } | null;
  due_date: string | null;
  due_date_end: string | null;
}

// ==================== FILE TYPES ====================

/** File upload for comments */
export interface FileUpload {
  download_url: string;
  filename?: string;
}

/** File item */
export interface FileItem {
  uuid: string;
  name: string;
  author: UserBasic;
  project: ProjectBasic;
  directory_uuid: string | null;
  date_add: string;
  order: number;
  type: FileItemType;
  filename: string | null;
  caption: string | null;
  mime_type: string | null;
  extension: string | null;
  size: number;
  color: string | null;
  items_count: number | null;
  link: string | null;
  link_type: string | null;
  note: string | null;
}

// ==================== CUSTOM FIELD TYPES ====================

/** Custom field */
export interface CustomField {
  uuid: string;
  custom_fields_types_uuid: string;
  project_id: number;
  author_id: number;
  name: string;
  date_add: string;
  priority: number;
}

/** Custom field value */
export interface CustomFieldValue {
  uuid: string;
  value: string;
  date_add: string;
  date_edited_at: string | null;
  author_id: number;
  task_id: number;
  custom_field_uuid: string;
}

/** Custom field enum value */
export interface CustomFieldEnumValue {
  uuid: string;
  task_id: number;
  custom_field_uuid: string;
  value: string;
  date_add: string;
  date_edited_at: string | null;
  author_id: number;
}

/** Custom field enum option */
export interface CustomFieldEnumOption {
  enum_uuid: string;
  enum_value: string;
  custom_field_uuid: string;
  custom_field_name: string;
}

// ==================== NOTE TYPES ====================

/** Note */
export interface Note {
  id: number;
  name: string;
  date_add: string;
  date_edited_at: string;
  state: State;
  content: string;
  author: UserBasic;
  project: ProjectBasic;
  files: FileFull[];
  comments: CommentWithFiles[];
}

// ==================== SEARCH TYPES ====================

/** Search result */
export interface SearchResult {
  score: number;
  id: number;
  uuid: string | null;
  name: string;
  author_id: number;
  type: SearchEntityType;
  highlight_name: string[];
  highlight_content: string[];
}

// ==================== REQUEST/INPUT TYPES ====================

/** Create project input */
export interface CreateProjectInput {
  name: string;
  currency_iso: CurrencyCode;
  project_owner_id?: number;
}

/** Create tasklist input */
export interface CreateTasklistInput {
  name: string;
}

/** Create task input */
export interface CreateTaskInput {
  name: string;
  due_date?: string;
  due_date_end?: string;
  worker?: number;
  priority_enum?: PriorityEnum;
  comment?: {
    content: string;
  };
  labels?: TaskLabelInput[];
  tracking_users_ids?: number[];
  turn_off_authors_tracking?: boolean;
  subtasks?: CreateSubtaskInput[];
}

/** Edit task input */
export interface EditTaskInput {
  name?: string;
  due_date?: string;
  due_date_end?: string;
  worker?: number;
  priority_enum?: PriorityEnum;
}

/** Create subtask input */
export interface CreateSubtaskInput {
  name: string;
  due_date?: string;
  due_date_end?: string;
  worker?: number;
  priority_enum?: PriorityEnum;
  comment?: {
    content: string;
  };
  labels?: TaskLabelInput[];
  tracking_users_ids?: number[];
}

/** Create comment input */
export interface CreateCommentInput {
  content: string;
  files?: FileUpload[];
}

/** Create work report input */
export interface CreateWorkReportInput {
  minutes: number;
  date_reported?: string;
  worker_id?: number;
  cost?: string;
  note?: string;
}

/** Edit work report input */
export interface EditWorkReportInput {
  minutes?: number;
  cost?: string;
  date_reported?: string;
  note?: string;
  task_id?: number;
}

/** Start time tracking input */
export interface StartTimeTrackingInput {
  task_id?: number;
  note?: string;
}

/** Edit time tracking input */
export interface EditTimeTrackingInput {
  task_id?: number;
  note?: string;
}

/** Create note input */
export interface CreateNoteInput {
  name: string;
  content?: string;
}

/** Create pinned item input */
export interface CreatePinnedItemInput {
  link: string;
  title: string;
}

/** Create custom field input */
export interface CreateCustomFieldInput {
  uuid?: string;
  name: string;
  type: string;
}

/** Search input */
export interface SearchInput {
  search_query: string;
  projects_ids?: number[];
  tasklists_ids?: number[];
  tasks_ids?: number[];
  authors_ids?: number[];
  workers_ids?: number[];
  state_ids?: SearchStateId[];
  lang?: string;
  due_date?: {
    date_from?: string;
    date_to?: string;
  };
  entity_type?: SearchEntityType;
  page?: number;
  limit?: number;
}

/** Out of office input */
export interface OutOfOfficeInput {
  out_of_office: {
    date_from: string;
    date_to: string;
  };
}

/** Invite users input */
export interface InviteUsersInput {
  projects_ids: number[];
  emails?: string[];
  users_ids?: number[];
}

/** Mark as invoiced input */
export interface MarkAsInvoicedInput {
  url: string;
  subject: string;
}

// ==================== LIST OPTIONS ====================

/** List projects options */
export interface ListProjectsOptions {
  order_by?: ProjectOrderBy;
  order?: OrderDirection;
}

/** List all projects options */
export interface ListAllProjectsOptions extends ListProjectsOptions {
  tags?: string[];
  states_ids?: number[];
  users_ids?: number[];
  created_in_range?: {
    date_from?: string;
    date_to?: string;
  };
  page?: number;
}

/** List comments options */
export interface ListCommentsOptions {
  projects_ids?: number[];
  type?: CommentType;
  order_by?: CommentOrderBy;
  order?: OrderDirection;
  page?: number;
}

/** List work reports options */
export interface ListWorkReportsOptions {
  projects_ids?: number[];
  users_ids?: number[];
  tasks_ids?: number[];
  tasks_labels?: string[];
  date_reported_range?: {
    date_from?: string;
    date_to?: string;
  };
  date_add_range?: {
    date_from?: string;
    date_to?: string;
  };
  date_edited_from?: string;
  page?: number;
}

/** List notifications options */
export interface ListNotificationsOptions {
  projects_ids?: number[];
  users_ids?: number[];
  teams_uuids?: string[];
  order?: OrderDirection;
  notification_types?: string[];
  only_unread?: boolean;
  page?: number;
}

/** List events options */
export interface ListEventsOptions {
  projects_ids?: number[];
  users_ids?: number[];
  teams_uuids?: string[];
  event_types?: string[];
  order?: OrderDirection;
  page?: number;
}

/** List issued invoices options */
export interface ListIssuedInvoicesOptions {
  date_range?: {
    date_from?: string;
    date_to?: string;
  };
  projects_ids?: number[];
  page?: number;
}

/** List tasks options */
export interface ListTasksOptions {
  page?: number;
}

/** List files options */
export interface ListFilesOptions {
  page?: number;
}
