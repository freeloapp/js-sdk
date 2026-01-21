/**
 * Time Tracking Resource
 * Handles all time tracking-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  WorkReport,
  StartTimeTrackingInput,
  EditTimeTrackingInput,
} from '../types/index.js';

/** Time tracking start response */
export interface TimeTrackingStartResponse {
  uuid: string;
}

/**
 * Time Tracking Resource class
 */
export class TimeTrackingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Start time tracking
   * @param data - Optional task ID and note
   * @returns Time tracking UUID
   */
  async start(data?: StartTimeTrackingInput): Promise<TimeTrackingStartResponse> {
    return this.http.post<TimeTrackingStartResponse>('/timetracking/start', data);
  }

  /**
   * Stop time tracking
   * @returns Created work report
   */
  async stop(): Promise<WorkReport> {
    return this.http.post<WorkReport>('/timetracking/stop');
  }

  /**
   * Update current time tracking
   * @param data - Task ID and/or note to update
   * @returns Time tracking UUID
   */
  async update(data?: EditTimeTrackingInput): Promise<TimeTrackingStartResponse> {
    return this.http.post<TimeTrackingStartResponse>('/timetracking/edit', data);
  }
}
