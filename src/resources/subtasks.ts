/**
 * Subtasks Resource
 * Handles all subtask-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  Subtask,
  PaginatedResponse,
  SuccessResponse,
  CreateSubtaskInput,
} from '../types/index.js';

/** Subtasks paginated response */
export interface SubtasksPaginatedResponse extends PaginatedResponse {
  data: {
    subtasks: Subtask[];
  };
}

/**
 * Subtasks Resource class
 */
export class SubtasksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get subtasks in a task
   * @param taskId - Task ID
   * @param page - Page number
   * @returns Paginated response with subtasks
   */
  async list(taskId: number, page?: number): Promise<SubtasksPaginatedResponse> {
    return this.http.get<SubtasksPaginatedResponse>(`/task/${taskId}/subtasks`, { p: page });
  }

  /**
   * Create a new subtask in a task
   * @param taskId - Task ID
   * @param data - Subtask creation data
   * @returns Created subtask
   */
  async create(taskId: number, data: CreateSubtaskInput): Promise<Subtask> {
    return this.http.post<Subtask>(`/task/${taskId}/subtasks`, data);
  }

  /**
   * Update a subtask (uses the task endpoint since subtasks are tasks)
   * @param subtaskId - Subtask ID
   * @param data - Subtask update data
   * @returns Success response
   */
  async update(subtaskId: number, data: Partial<CreateSubtaskInput>): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${subtaskId}`, data);
  }

  /**
   * Delete a subtask (uses the task endpoint since subtasks are tasks)
   * @param subtaskId - Subtask ID
   * @returns Success response
   */
  async delete(subtaskId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/task/${subtaskId}`);
  }

  /**
   * Finish a subtask
   * @param subtaskId - Subtask ID
   * @returns Success response
   */
  async finish(subtaskId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${subtaskId}/finish`);
  }

  /**
   * Activate a finished subtask
   * @param subtaskId - Subtask ID
   * @returns Success response
   */
  async activate(subtaskId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/task/${subtaskId}/activate`);
  }
}
