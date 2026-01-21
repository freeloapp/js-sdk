/**
 * Tasklists Resource
 * Handles all tasklist-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  TasklistBasic,
  TasklistFull,
  TasklistDetail,
  TasklistWithBudget,
  PaginatedResponse,
  SuccessResponse,
  CreateTasklistInput,
  Currency,
} from '../types/index.js';

/** Tasklists paginated response */
export interface TasklistsPaginatedResponse extends PaginatedResponse {
  data: {
    tasklists: TasklistFull[];
  };
}

/**
 * Tasklists Resource class
 */
export class TasklistsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all tasklists
   * @param page - Page number
   * @returns Paginated response with tasklists
   */
  async list(page?: number): Promise<TasklistsPaginatedResponse> {
    return this.http.get<TasklistsPaginatedResponse>('/all-tasklists', { p: page });
  }

  /**
   * Get tasklists in a project
   * @param projectId - Project ID
   * @returns Array of tasklists with budgets
   */
  async listByProject(projectId: number): Promise<TasklistWithBudget[]> {
    return this.http.get<TasklistWithBudget[]>(`/project/${projectId}/tasklists`);
  }

  /**
   * Get a single tasklist by ID
   * @param tasklistId - Tasklist ID
   * @returns Tasklist detail
   */
  async get(tasklistId: number): Promise<TasklistDetail> {
    return this.http.get<TasklistDetail>(`/tasklist/${tasklistId}`);
  }

  /**
   * Create a new tasklist in a project
   * @param projectId - Project ID
   * @param data - Tasklist creation data
   * @returns Created tasklist basic info
   */
  async create(projectId: number, data: CreateTasklistInput): Promise<TasklistBasic> {
    return this.http.post<TasklistBasic>(`/project/${projectId}/tasklists`, data);
  }

  /**
   * Create a tasklist from template
   * @param templateId - Template tasklist ID
   * @param projectId - Target project ID
   * @param name - New tasklist name (optional)
   * @returns Created tasklist basic info
   */
  async createFromTemplate(
    templateId: number,
    projectId: number,
    name?: string
  ): Promise<TasklistBasic> {
    return this.http.post<TasklistBasic>(`/tasklist/create-from-template/${templateId}`, {
      project_id: projectId,
      name,
    });
  }

  /**
   * Update tasklist name
   * @param tasklistId - Tasklist ID
   * @param name - New name
   * @returns Updated tasklist basic info
   */
  async update(tasklistId: number, name: string): Promise<TasklistBasic> {
    return this.http.post<TasklistBasic>(`/tasklist/${tasklistId}`, { name });
  }

  /**
   * Delete a tasklist
   * @param tasklistId - Tasklist ID
   * @returns Success response
   */
  async delete(tasklistId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/tasklist/${tasklistId}`);
  }

  /**
   * Archive a tasklist
   * @param tasklistId - Tasklist ID
   * @returns Success response
   */
  async archive(tasklistId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/tasklist/${tasklistId}/archive`);
  }

  /**
   * Activate an archived tasklist
   * @param tasklistId - Tasklist ID
   * @returns Success response
   */
  async activate(tasklistId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/tasklist/${tasklistId}/activate`);
  }

  /**
   * Move a tasklist to another project
   * @param tasklistId - Tasklist ID
   * @param projectId - Target project ID
   * @returns Success response
   */
  async move(tasklistId: number, projectId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/tasklist/${tasklistId}/move`, {
      project_id: projectId,
    });
  }

  /**
   * Get tasklist budget
   * @param tasklistId - Tasklist ID
   * @returns Budget information
   */
  async getBudget(tasklistId: number): Promise<{ budget: Currency }> {
    return this.http.get<{ budget: Currency }>(`/tasklist/${tasklistId}/budget`);
  }

  /**
   * Set tasklist budget
   * @param tasklistId - Tasklist ID
   * @param amount - Budget amount (string with 2 decimal places × 100)
   * @returns Success response
   */
  async setBudget(tasklistId: number, amount: string): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/tasklist/${tasklistId}/budget`, {
      budget: amount,
    });
  }

  /**
   * Delete tasklist budget
   * @param tasklistId - Tasklist ID
   * @returns Success response
   */
  async deleteBudget(tasklistId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/tasklist/${tasklistId}/budget`);
  }
}
