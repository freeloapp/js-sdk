/**
 * Projects Resource
 * Handles all project-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  ProjectWithTasklists,
  ProjectFull,
  ProjectDetail,
  ProjectBasic,
  UserBasic,
  ProjectLabel,
  PinnedItem,
  PaginatedResponse,
  SuccessResponse,
  CreateProjectInput,
  ListProjectsOptions,
  ListAllProjectsOptions,
  CreatePinnedItemInput,
} from '../types/index.js';

/** Projects paginated response */
export interface ProjectsPaginatedResponse extends PaginatedResponse {
  data: {
    projects: ProjectFull[];
  };
}

/** Invited projects paginated response */
export interface InvitedProjectsPaginatedResponse extends PaginatedResponse {
  data: {
    invited_projects: ProjectWithTasklists[];
  };
}

/** Archived projects paginated response */
export interface ArchivedProjectsPaginatedResponse extends PaginatedResponse {
  data: {
    archived_projects: ProjectWithTasklists[];
  };
}

/** Template projects paginated response */
export interface TemplateProjectsPaginatedResponse extends PaginatedResponse {
  data: {
    template_projects: ProjectWithTasklists[];
  };
}

/** Workers paginated response */
export interface WorkersPaginatedResponse extends PaginatedResponse {
  data: {
    workers: UserBasic[];
  };
}

/**
 * Projects Resource class
 */
export class ProjectsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all own active projects
   * @param options - List options (order_by, order)
   * @returns Array of projects with their tasklists
   */
  async list(options?: ListProjectsOptions): Promise<ProjectWithTasklists[]> {
    return this.http.get<ProjectWithTasklists[]>('/projects', {
      order_by: options?.order_by,
      order: options?.order,
    });
  }

  /**
   * Get all projects (owned and invited) with pagination
   * @param options - List options including filters and pagination
   * @returns Paginated response with projects
   */
  async listAll(options?: ListAllProjectsOptions): Promise<ProjectsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      order_by: options?.order_by,
      order: options?.order,
      p: options?.page,
    };

    if (options?.tags) {
      params['tags'] = options.tags;
    }
    if (options?.states_ids) {
      params['states_ids'] = options.states_ids;
    }
    if (options?.users_ids) {
      params['users_ids'] = options.users_ids;
    }
    if (options?.created_in_range?.date_from) {
      params['created_in_range[date_from]'] = options.created_in_range.date_from;
    }
    if (options?.created_in_range?.date_to) {
      params['created_in_range[date_to]'] = options.created_in_range.date_to;
    }

    return this.http.get<ProjectsPaginatedResponse>('/all-projects', params);
  }

  /**
   * Get invited projects
   * @param page - Page number
   * @returns Paginated response with invited projects
   */
  async listInvited(page?: number): Promise<InvitedProjectsPaginatedResponse> {
    return this.http.get<InvitedProjectsPaginatedResponse>('/invited-projects', { p: page });
  }

  /**
   * Get archived projects
   * @param page - Page number
   * @returns Paginated response with archived projects
   */
  async listArchived(page?: number): Promise<ArchivedProjectsPaginatedResponse> {
    return this.http.get<ArchivedProjectsPaginatedResponse>('/archived-projects', { p: page });
  }

  /**
   * Get template projects
   * @param options - List options
   * @returns Paginated response with template projects
   */
  async listTemplates(options?: ListAllProjectsOptions): Promise<TemplateProjectsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      order_by: options?.order_by,
      order: options?.order,
      p: options?.page,
    };

    if (options?.tags) {
      params['tags'] = options.tags;
    }
    if (options?.users_ids) {
      params['users_ids'] = options.users_ids;
    }
    if (options?.created_in_range?.date_from) {
      params['created_in_range[date_from]'] = options.created_in_range.date_from;
    }
    if (options?.created_in_range?.date_to) {
      params['created_in_range[date_to]'] = options.created_in_range.date_to;
    }

    return this.http.get<TemplateProjectsPaginatedResponse>('/template-projects', params);
  }

  /**
   * Get user's projects
   * @param userId - User ID
   * @param options - List options
   * @returns Paginated response with user's projects
   */
  async listByUser(userId: number, options?: ListAllProjectsOptions): Promise<ProjectsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      order_by: options?.order_by,
      order: options?.order,
      p: options?.page,
    };

    if (options?.states_ids) {
      params['states_ids'] = options.states_ids;
    }

    return this.http.get<ProjectsPaginatedResponse>(`/user/${userId}/all-projects`, params);
  }

  /**
   * Get a single project by ID
   * @param projectId - Project ID
   * @returns Project detail
   */
  async get(projectId: number): Promise<ProjectDetail> {
    return this.http.get<ProjectDetail>(`/project/${projectId}`);
  }

  /**
   * Create a new project
   * @param data - Project creation data
   * @returns Created project basic info
   */
  async create(data: CreateProjectInput): Promise<ProjectBasic> {
    return this.http.post<ProjectBasic>('/projects', data);
  }

  /**
   * Create a project from template
   * @param templateId - Template project ID
   * @param name - New project name
   * @param options - Additional options
   * @returns Created project basic info
   */
  async createFromTemplate(
    templateId: number,
    name: string,
    options?: {
      general_settings?: {
        due_date_forward?: boolean;
        due_date_forward_count?: number;
        due_date_forward_unit?: 'hours' | 'days' | 'weeks' | 'months';
      };
    }
  ): Promise<ProjectBasic> {
    return this.http.post<ProjectBasic>(`/project/create-from-template/${templateId}`, {
      name,
      ...options,
    });
  }

  /**
   * Delete a project
   * @param projectId - Project ID
   * @returns Success response
   */
  async delete(projectId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/project/${projectId}`);
  }

  /**
   * Archive a project
   * @param projectId - Project ID
   * @returns Success response
   */
  async archive(projectId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project/${projectId}/archive`);
  }

  /**
   * Activate an archived project
   * @param projectId - Project ID
   * @returns Success response
   */
  async activate(projectId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project/${projectId}/activate`);
  }

  /**
   * Get project workers
   * @param projectId - Project ID
   * @param page - Page number
   * @returns Paginated response with workers
   */
  async getWorkers(projectId: number, page?: number): Promise<WorkersPaginatedResponse> {
    return this.http.get<WorkersPaginatedResponse>(`/project/${projectId}/workers`, { p: page });
  }

  /**
   * Remove workers from project by IDs
   * @param projectId - Project ID
   * @param userIds - Array of user IDs to remove
   * @returns Success response
   */
  async removeWorkersByIds(projectId: number, userIds: number[]): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project/${projectId}/remove-workers/by-ids`, {
      users_ids: userIds,
    });
  }

  /**
   * Remove workers from project by emails
   * @param projectId - Project ID
   * @param emails - Array of emails to remove
   * @returns Success response
   */
  async removeWorkersByEmails(projectId: number, emails: string[]): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project/${projectId}/remove-workers/by-emails`, {
      emails,
    });
  }

  // ==================== PROJECT LABELS ====================

  /**
   * Get project labels
   * @returns Array of project labels
   */
  async getLabels(): Promise<ProjectLabel[]> {
    return this.http.get<ProjectLabel[]>('/project-labels');
  }

  /**
   * Create a project label
   * @param name - Label name
   * @param color - Label color (optional)
   * @returns Created label
   */
  async createLabel(name: string, color?: string): Promise<ProjectLabel> {
    return this.http.post<ProjectLabel>('/project-labels', { name, color });
  }

  /**
   * Edit a project label
   * @param labelId - Label ID
   * @param data - Label update data
   * @returns Updated label
   */
  async editLabel(
    labelId: number,
    data: { name?: string; color?: string; is_private?: boolean }
  ): Promise<ProjectLabel> {
    return this.http.post<ProjectLabel>(`/project-labels/${labelId}`, data);
  }

  /**
   * Add label to project
   * @param projectId - Project ID
   * @param labelId - Label ID
   * @returns Success response
   */
  async addLabelToProject(projectId: number, labelId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project-labels/add-to-project/${projectId}`, {
      label_id: labelId,
    });
  }

  /**
   * Remove label from project
   * @param projectId - Project ID
   * @param labelId - Label ID
   * @returns Success response
   */
  async removeLabelFromProject(projectId: number, labelId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/project-labels/remove-from-project/${projectId}`, {
      label_id: labelId,
    });
  }

  // ==================== PINNED ITEMS ====================

  /**
   * Get pinned items in project
   * @param projectId - Project ID
   * @returns Array of pinned items
   */
  async getPinnedItems(projectId: number): Promise<PinnedItem[]> {
    return this.http.get<PinnedItem[]>(`/project/${projectId}/pinned-items`);
  }

  /**
   * Create pinned item in project
   * @param projectId - Project ID
   * @param data - Pinned item data
   * @returns Created pinned item
   */
  async createPinnedItem(projectId: number, data: CreatePinnedItemInput): Promise<PinnedItem> {
    return this.http.post<PinnedItem>(`/project/${projectId}/pinned-items`, data);
  }

  /**
   * Delete pinned item
   * @param pinnedItemId - Pinned item ID
   * @returns Success response
   */
  async deletePinnedItem(pinnedItemId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/pinned-items/${pinnedItemId}`);
  }
}
