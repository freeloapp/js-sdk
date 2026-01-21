/**
 * Tasks Resource
 * Handles all task-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  TaskFull,
  TaskDetail,
  TaskCreated,
  TaskFinished,
  TaskLabel,
  TaskLabelInput,
  PaginatedResponse,
  SuccessResponse,
  CreateTaskInput,
  EditTaskInput,
  ListTasksOptions,
} from '../types/index.js';

/** Tasks paginated response */
export interface TasksPaginatedResponse extends PaginatedResponse {
  data: {
    tasks: TaskFull[];
  };
}

/** Finished tasks paginated response */
export interface FinishedTasksPaginatedResponse extends PaginatedResponse {
  data: {
    finished_tasks: TaskFinished[];
  };
}

/**
 * Tasks Resource class
 */
export class TasksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all tasks
   * @param options - List options
   * @returns Paginated response with tasks
   */
  async list(options?: ListTasksOptions): Promise<TasksPaginatedResponse> {
    return this.http.get<TasksPaginatedResponse>('/all-tasks', { p: options?.page });
  }

  /**
   * Get finished tasks
   * @param page - Page number
   * @returns Paginated response with finished tasks
   */
  async listFinished(page?: number): Promise<FinishedTasksPaginatedResponse> {
    return this.http.get<FinishedTasksPaginatedResponse>('/finished-tasks', { p: page });
  }

  /**
   * Get tasks in a tasklist
   * @param tasklistId - Tasklist ID
   * @param page - Page number
   * @returns Paginated response with tasks
   */
  async listByTasklist(tasklistId: number, page?: number): Promise<TasksPaginatedResponse> {
    return this.http.get<TasksPaginatedResponse>(`/tasklist/${tasklistId}/tasks`, { p: page });
  }

  /**
   * Get a single task by ID
   * @param taskId - Task ID
   * @returns Task detail
   */
  async get(taskId: number): Promise<TaskDetail> {
    return this.http.get<TaskDetail>(`/task/${taskId}`);
  }

  /**
   * Create a new task in a tasklist
   * @param tasklistId - Tasklist ID
   * @param data - Task creation data
   * @returns Created task
   */
  async create(tasklistId: number, data: CreateTaskInput): Promise<TaskCreated> {
    return this.http.post<TaskCreated>(`/tasklist/${tasklistId}/tasks`, data);
  }

  /**
   * Create a task from template
   * @param templateId - Template task ID
   * @param tasklistId - Target tasklist ID
   * @param options - Additional options
   * @returns Created task
   */
  async createFromTemplate(
    templateId: number,
    tasklistId: number,
    options?: {
      name?: string;
      general_settings?: {
        due_date_forward?: boolean;
        due_date_forward_count?: number;
        due_date_forward_unit?: 'hours' | 'days' | 'weeks' | 'months';
      };
    }
  ): Promise<TaskCreated> {
    return this.http.post<TaskCreated>(`/task/create-from-template/${templateId}`, {
      tasklist_id: tasklistId,
      ...options,
    });
  }

  /**
   * Update a task
   * @param taskId - Task ID
   * @param data - Task update data
   * @returns Updated task
   */
  async update(taskId: number, data: EditTaskInput): Promise<TaskCreated> {
    return this.http.post<TaskCreated>(`/task/${taskId}`, data);
  }

  /**
   * Delete a task
   * @param taskId - Task ID
   * @returns Success response
   */
  async delete(taskId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/task/${taskId}`);
  }

  /**
   * Finish a task
   * @param taskId - Task ID
   * @returns Success response
   */
  async finish(taskId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/finish`);
  }

  /**
   * Activate a finished task
   * @param taskId - Task ID
   * @returns Success response
   */
  async activate(taskId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/activate`);
  }

  /**
   * Move a task to another tasklist
   * @param taskId - Task ID
   * @param tasklistId - Target tasklist ID
   * @returns Success response
   */
  async move(taskId: number, tasklistId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/move`, {
      tasklist_id: tasklistId,
    });
  }

  /**
   * Set task description
   * @param taskId - Task ID
   * @param content - Description content
   * @returns Success response
   */
  async setDescription(taskId: number, content: string): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/description`, { content });
  }

  /**
   * Set reminder for task
   * @param taskId - Task ID
   * @param dateRemind - Reminder date (ISO format)
   * @returns Success response
   */
  async setReminder(taskId: number, dateRemind: string): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/reminder`, { date_remind: dateRemind });
  }

  /**
   * Delete reminder for task
   * @param taskId - Task ID
   * @returns Success response
   */
  async deleteReminder(taskId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/task/${taskId}/reminder`);
  }

  // ==================== TIME ESTIMATES ====================

  /**
   * Set total time estimate for task
   * @param taskId - Task ID
   * @param minutes - Time estimate in minutes
   * @returns Success response
   */
  async setTotalTimeEstimate(taskId: number, minutes: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/total-time-estimate`, { minutes });
  }

  /**
   * Delete total time estimate for task
   * @param taskId - Task ID
   * @returns Success response
   */
  async deleteTotalTimeEstimate(taskId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/task/${taskId}/total-time-estimate`);
  }

  /**
   * Set user time estimate for task
   * @param taskId - Task ID
   * @param userId - User ID
   * @param minutes - Time estimate in minutes
   * @returns Success response
   */
  async setUserTimeEstimate(taskId: number, userId: number, minutes: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${taskId}/users-time-estimates/${userId}`, { minutes });
  }

  /**
   * Delete user time estimate for task
   * @param taskId - Task ID
   * @param userId - User ID
   * @returns Success response
   */
  async deleteUserTimeEstimate(taskId: number, userId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/task/${taskId}/users-time-estimates/${userId}`);
  }

  // ==================== TASK LABELS ====================

  /**
   * Get all task labels
   * @returns Array of task labels
   */
  async getLabels(): Promise<TaskLabel[]> {
    return this.http.get<TaskLabel[]>('/task-labels');
  }

  /**
   * Create task labels
   * @param labels - Array of labels to create
   * @returns Success response
   */
  async createLabels(labels: TaskLabelInput[]): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>('/task-labels', { labels });
  }

  /**
   * Add labels to task
   * @param taskId - Task ID
   * @param labels - Array of labels to add
   * @returns Success response
   */
  async addLabels(taskId: number, labels: TaskLabelInput[]): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task-labels/add-to-task/${taskId}`, { labels });
  }

  /**
   * Remove labels from task
   * @param taskId - Task ID
   * @param labels - Array of labels to remove
   * @returns Success response
   */
  async removeLabels(taskId: number, labels: TaskLabelInput[]): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task-labels/remove-from-task/${taskId}`, { labels });
  }
}
