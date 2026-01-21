/**
 * Freelo SDK Client
 * Main entry point for the SDK
 */

import { HttpClient } from './http.js';
import {
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

/**
 * Configuration options for the Freelo client
 */
export interface FreeloConfig {
  /** Your Freelo account email */
  email: string;
  /** Your API key from Freelo settings */
  apiKey: string;
  /** User-Agent string identifying your application (required by API) */
  userAgent: string;
  /** Optional base URL (defaults to https://api.freelo.io/v1) */
  baseUrl?: string;
  /** Optional request timeout in milliseconds (defaults to 30000) */
  timeout?: number;
}

/** Default configuration values */
const DEFAULT_BASE_URL = 'https://api.freelo.io/v1';
const DEFAULT_TIMEOUT = 30000;

/**
 * Main Freelo SDK client
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
 *
 * // Start time tracking
 * await freelo.timeTracking.start({ task_id: taskId });
 *
 * // Search
 * const results = await freelo.search.search({ search_query: 'bug fix' });
 * ```
 */
export class Freelo {
  private readonly http: HttpClient;

  /** Project operations */
  public readonly projects: ProjectsResource;

  /** Tasklist operations */
  public readonly tasklists: TasklistsResource;

  /** Task operations */
  public readonly tasks: TasksResource;

  /** Subtask operations */
  public readonly subtasks: SubtasksResource;

  /** Comment operations */
  public readonly comments: CommentsResource;

  /** Time tracking operations */
  public readonly timeTracking: TimeTrackingResource;

  /** Work report operations */
  public readonly workReports: WorkReportsResource;

  /** User operations */
  public readonly users: UsersResource;

  /** File operations */
  public readonly files: FilesResource;

  /** Search operations */
  public readonly search: SearchResource;

  /** Notification operations */
  public readonly notifications: NotificationsResource;

  /** Event operations */
  public readonly events: EventsResource;

  /** Custom field operations */
  public readonly customFields: CustomFieldsResource;

  /** Note operations */
  public readonly notes: NotesResource;

  /** Invoice operations */
  public readonly invoicing: InvoicingResource;

  /** State definitions */
  public readonly states: StatesResource;

  constructor(config: FreeloConfig) {
    // Validate required config
    if (!config.email) {
      throw new Error('Freelo config: email is required');
    }
    if (!config.apiKey) {
      throw new Error('Freelo config: apiKey is required');
    }
    if (!config.userAgent) {
      throw new Error('Freelo config: userAgent is required');
    }

    // Create HTTP client
    this.http = new HttpClient({
      email: config.email,
      apiKey: config.apiKey,
      userAgent: config.userAgent,
      baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
      timeout: config.timeout ?? DEFAULT_TIMEOUT,
    });

    // Initialize resource namespaces
    this.projects = new ProjectsResource(this.http);
    this.tasklists = new TasklistsResource(this.http);
    this.tasks = new TasksResource(this.http);
    this.subtasks = new SubtasksResource(this.http);
    this.comments = new CommentsResource(this.http);
    this.timeTracking = new TimeTrackingResource(this.http);
    this.workReports = new WorkReportsResource(this.http);
    this.users = new UsersResource(this.http);
    this.files = new FilesResource(this.http);
    this.search = new SearchResource(this.http);
    this.notifications = new NotificationsResource(this.http);
    this.events = new EventsResource(this.http);
    this.customFields = new CustomFieldsResource(this.http);
    this.notes = new NotesResource(this.http);
    this.invoicing = new InvoicingResource(this.http);
    this.states = new StatesResource(this.http);
  }
}

export default Freelo;
