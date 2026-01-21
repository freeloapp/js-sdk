/**
 * Events Resource
 * Handles all event-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  Event,
  PaginatedResponse,
  ListEventsOptions,
} from '../types/index.js';

/** Events paginated response */
export interface EventsPaginatedResponse extends PaginatedResponse {
  data: {
    events: Event[];
  };
}

/**
 * Events Resource class
 */
export class EventsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all events
   * @param options - List options
   * @returns Paginated response with events
   */
  async list(options?: ListEventsOptions): Promise<EventsPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      order: options?.order,
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
    if (options?.event_types) {
      params['event_types'] = options.event_types;
    }

    return this.http.get<EventsPaginatedResponse>('/all-events', params);
  }
}
