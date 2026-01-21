/**
 * Files Resource
 * Handles all file-related API operations
 */

import { HttpClient, type FileUploadResponse } from '../http.js';
import type {
  FileItem,
  PaginatedResponse,
  SuccessResponse,
  ListFilesOptions,
} from '../types/index.js';

export type { FileUploadResponse };

/** Files paginated response */
export interface FilesPaginatedResponse extends PaginatedResponse {
  data: {
    files: FileItem[];
  };
}

/**
 * Files Resource class
 */
export class FilesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get all files
   * @param options - List options
   * @returns Paginated response with files
   */
  async list(options?: ListFilesOptions): Promise<FilesPaginatedResponse> {
    return this.http.get<FilesPaginatedResponse>('/all-files', { p: options?.page });
  }

  /**
   * Get files in a project
   * @param projectId - Project ID
   * @param page - Page number
   * @returns Paginated response with files
   */
  async listByProject(projectId: number, page?: number): Promise<FilesPaginatedResponse> {
    return this.http.get<FilesPaginatedResponse>(`/project/${projectId}/files`, { p: page });
  }

  /**
   * Get file detail
   * @param fileUuid - File UUID
   * @returns File item
   */
  async get(fileUuid: string): Promise<FileItem> {
    return this.http.get<FileItem>(`/file/${fileUuid}`);
  }

  /**
   * Update file
   * @param fileUuid - File UUID
   * @param data - Update data (caption, note)
   * @returns Updated file item
   */
  async update(fileUuid: string, data: { caption?: string; note?: string }): Promise<FileItem> {
    return this.http.post<FileItem>(`/file/${fileUuid}`, data);
  }

  /**
   * Delete file
   * @param fileUuid - File UUID
   * @returns Success response
   */
  async delete(fileUuid: string): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/file/${fileUuid}`);
  }

  /**
   * Upload a file (max 100MB)
   * The returned UUID can be used in comment content as:
   * `<a data-freelo-uuid="uuid">caption</a>`
   * @param file - File to upload (Blob in browser, Buffer in Node.js)
   * @param filename - Filename for the uploaded file
   * @returns File upload response with uuid, download_url, and filename
   */
  async upload(file: Blob | ArrayBuffer, filename: string): Promise<FileUploadResponse> {
    return this.http.uploadFile('/file/upload', file, filename);
  }
}
