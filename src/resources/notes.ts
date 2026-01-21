/**
 * Notes Resource
 * Handles all note-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  Note,
  CreateNoteInput,
} from '../types/index.js';

/**
 * Notes Resource class
 */
export class NotesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get a note by ID
   * @param noteId - Note ID
   * @returns Note
   */
  async get(noteId: number): Promise<Note> {
    return this.http.get<Note>(`/note/${noteId}`);
  }

  /**
   * Create a note in a project
   * @param projectId - Project ID
   * @param data - Note creation data
   * @returns Created note
   */
  async create(projectId: number, data: CreateNoteInput): Promise<Note> {
    return this.http.post<Note>(`/project/${projectId}/note`, data);
  }

  /**
   * Update a note
   * @param noteId - Note ID
   * @param data - Note update data
   * @returns Updated note
   */
  async update(noteId: number, data: CreateNoteInput): Promise<Note> {
    return this.http.post<Note>(`/note/${noteId}`, data);
  }

  /**
   * Delete a note
   * @param noteId - Note ID
   * @returns Deleted note
   */
  async delete(noteId: number): Promise<Note> {
    return this.http.delete<Note>(`/note/${noteId}`);
  }
}
