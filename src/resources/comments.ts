/**
 * Comments Resource
 * Handles all comment-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  Comment,
  CommentFull,
  PaginatedResponse,
  SuccessResponse,
  CreateCommentInput,
  ListCommentsOptions,
} from '../types/index.js';

/** Comments paginated response */
export interface CommentsPaginatedResponse extends PaginatedResponse {
  data: {
    comments: CommentFull[];
  };
}

/**
 * Comments Resource class
 */
export class CommentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all comments
   * @param options - List options
   * @returns Paginated response with comments
   */
  async list(options?: ListCommentsOptions): Promise<CommentsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      type: options?.type,
      order_by: options?.order_by,
      order: options?.order,
      p: options?.page,
    };

    if (options?.projects_ids) {
      params['projects_ids'] = options.projects_ids;
    }

    return this.http.get<CommentsPaginatedResponse>('/all-comments', params);
  }

  /**
   * Create a comment on a task
   * If the task has no comments, this will create a description instead
   * @param taskId - Task ID
   * @param data - Comment creation data
   * @returns Created comment
   */
  async create(taskId: number, data: CreateCommentInput): Promise<Comment> {
    return this.http.post<Comment>(`/task/${taskId}/comments`, data);
  }

  /**
   * Update a comment
   * @param commentId - Comment ID
   * @param data - Comment update data
   * @returns Updated comment
   */
  async update(commentId: number, data: CreateCommentInput): Promise<Comment> {
    return this.http.post<Comment>(`/comment/${commentId}`, data);
  }

  /**
   * Delete a comment
   * @param commentId - Comment ID
   * @returns Success response
   */
  async delete(commentId: number): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/comment/${commentId}`);
  }
}
