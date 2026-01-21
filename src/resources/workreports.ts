/**
 * Work Reports Resource
 * Handles all work report-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  WorkReport,
  WorkReportFull,
  PaginatedResponse,
  SuccessResponse,
  CreateWorkReportInput,
  EditWorkReportInput,
  ListWorkReportsOptions,
} from '../types/index.js';

/** Work reports paginated response */
export interface WorkReportsPaginatedResponse extends PaginatedResponse {
  data: {
    reports: WorkReportFull[];
  };
}

/**
 * Work Reports Resource class
 */
export class WorkReportsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all work reports
   * @param options - List options
   * @returns Paginated response with work reports
   */
  async list(options?: ListWorkReportsOptions): Promise<WorkReportsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      date_edited_from: options?.date_edited_from,
      p: options?.page,
    };

    if (options?.projects_ids) {
      params['projects_ids'] = options.projects_ids;
    }
    if (options?.users_ids) {
      params['users_ids'] = options.users_ids;
    }
    if (options?.tasks_ids) {
      params['tasks_ids'] = options.tasks_ids;
    }
    if (options?.tasks_labels) {
      params['tasks_labels'] = options.tasks_labels;
    }
    if (options?.date_reported_range?.date_from) {
      params['date_reported_range[date_from]'] = options.date_reported_range.date_from;
    }
    if (options?.date_reported_range?.date_to) {
      params['date_reported_range[date_to]'] = options.date_reported_range.date_to;
    }
    if (options?.date_add_range?.date_from) {
      params['date_add_range[date_from]'] = options.date_add_range.date_from;
    }
    if (options?.date_add_range?.date_to) {
      params['date_add_range[date_to]'] = options.date_add_range.date_to;
    }

    return this.http.get<WorkReportsPaginatedResponse>('/work-reports', params);
  }

  /**
   * Create a work report on a task
   * @param taskId - Task ID
   * @param data - Work report creation data
   * @returns Created work report
   */
  async create(taskId: number, data: CreateWorkReportInput): Promise<WorkReport> {
    return this.http.post<WorkReport>(`/task/${taskId}/work-reports`, data);
  }

  /**
   * Update a work report
   * @param workReportId - Work report ID
   * @param data - Work report update data
   * @returns Updated work report
   */
  async update(workReportId: number, data: EditWorkReportInput): Promise<WorkReport> {
    return this.http.post<WorkReport>(`/work-reports/${workReportId}`, data);
  }

  /**
   * Delete a work report
   * @param workReportId - Work report ID
   * @returns Success response
   */
  async delete(workReportId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/work-reports/${workReportId}`);
  }
}
