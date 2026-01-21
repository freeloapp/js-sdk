/**
 * Users Resource
 * Handles all user-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  UserBasic,
  PaginatedResponse,
  SuccessResponse,
  InviteUsersInput,
  OutOfOfficeInput,
} from '../types/index.js';

/** Users paginated response */
export interface UsersPaginatedResponse extends PaginatedResponse {
  data: {
    users: UserBasic[];
  };
}

/** Invite users response */
export interface InviteUsersResponse {
  newly_invited_users_to_projects: unknown[];
  newly_created_users: {
    id: number;
    email: string;
  }[];
  newly_invited_users: {
    id: number;
    projects_ids: number[];
    email: string;
  }[];
  removed_users_from_projects: unknown[];
}

/** Out of office response */
export interface OutOfOfficeResponse {
  out_of_office: {
    date_from: string;
    date_to: string;
  } | null;
}

/**
 * Users Resource class
 */
export class UsersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all users (coworkers)
   * @param page - Page number
   * @returns Paginated response with users
   */
  async list(page?: number): Promise<UsersPaginatedResponse> {
    return this.http.get<UsersPaginatedResponse>('/users', { p: page });
  }

  /**
   * Get users who promoted current user as project manager
   * @returns Array of users
   */
  async getProjectManagerOf(): Promise<UserBasic[]> {
    return this.http.get<UserBasic[]>('/users/project-manager-of');
  }

  /**
   * Invite users to projects
   * @param data - Invite data with project IDs and user emails/IDs
   * @returns Invite response with created/invited users
   */
  async inviteToProjects(data: InviteUsersInput): Promise<InviteUsersResponse> {
    return this.http.post<InviteUsersResponse>('/users/manage-workers', data);
  }

  /**
   * Get out of office status for a user
   * @param userId - User ID
   * @returns Out of office status
   */
  async getOutOfOffice(userId: number): Promise<OutOfOfficeResponse> {
    return this.http.get<OutOfOfficeResponse>(`/user/${userId}/out-of-office`);
  }

  /**
   * Enable out of office for a user
   * @param userId - User ID
   * @param data - Out of office dates
   * @returns Success response
   */
  async enableOutOfOffice(userId: number, data: OutOfOfficeInput): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/user/${userId}/out-of-office`, data);
  }

  /**
   * Disable out of office for a user
   * @param userId - User ID
   * @returns Success response
   */
  async disableOutOfOffice(userId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/user/${userId}/out-of-office`);
  }
}
