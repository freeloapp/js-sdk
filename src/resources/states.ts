/**
 * States Resource
 * Handles state definitions API operations
 */

import { HttpClient } from '../http.js';
import type { State } from '../types/index.js';

/**
 * States Resource class
 */
export class StatesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all available states
   * @returns Array of states
   */
  async list(): Promise<State[]> {
    return this.http.get<State[]>('/states');
  }
}
