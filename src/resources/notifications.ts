/**
 * Notifications Resource
 * Handles all notification-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  Notification,
  PaginatedResponse,
  SuccessResponse,
  ListNotificationsOptions,
} from '../types/index.js';

/** Notifications paginated response */
export interface NotificationsPaginatedResponse extends PaginatedResponse {
  data: {
    notifications: Notification[];
  };
}

/**
 * Notifications Resource class
 */
export class NotificationsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all notifications
   * @param options - List options
   * @returns Paginated response with notifications
   */
  async list(options?: ListNotificationsOptions): Promise<NotificationsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      order: options?.order,
      only_unread: options?.only_unread,
      p: options?.page,
    };

    if (options?.projects_ids) {
      params['projects_ids'] = options.projects_ids;
    }
    if (options?.users_ids) {
      params['users_ids'] = options.users_ids;
    }
    if (options?.teams_uuids) {
      params['teams_uuids'] = options.teams_uuids;
    }
    if (options?.notification_types) {
      params['notification_types'] = options.notification_types;
    }

    return this.http.get<NotificationsPaginatedResponse>('/all-notifications', params);
  }

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   * @returns Success response
   */
  async markAsRead(notificationId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/notification/${notificationId}/mark-as-read`);
  }

  /**
   * Mark notification as unread
   * @param notificationId - Notification ID
   * @returns Success response
   */
  async markAsUnread(notificationId: number): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>(`/notification/${notificationId}/mark-as-unread`);
  }

  /**
   * Mark all notifications as read
   * @returns Success response
   */
  async markAllAsRead(): Promise<SuccessResponse> {
    return this.http.post<SuccessResponse>('/notifications/mark-all-as-read');
  }
}
