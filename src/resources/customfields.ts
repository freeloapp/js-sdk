/**
 * Custom Fields Resource
 * Handles all custom field-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  CustomField,
  CustomFieldValue,
  CustomFieldEnumValue,
  CustomFieldEnumOption,
  SuccessResponse,
  CreateCustomFieldInput,
} from '../types/index.js';

/** Custom field types response */
export interface CustomFieldTypesResponse {
  custom_field_types: {
    uuid: string;
    name: string;
  }[];
}

/** Custom fields for project response */
export interface CustomFieldsForProjectResponse {
  custom_fields: CustomField[];
  is_commander: boolean;
}

/** Create custom field response */
export interface CreateCustomFieldResponse {
  custom_field: CustomField;
}

/** Custom field value response */
export interface CustomFieldValueResponse {
  custom_field_value: CustomFieldValue;
}

/** Custom field enum value response */
export interface CustomFieldEnumValueResponse {
  customFieldEnum: CustomFieldEnumValue;
}

/** Custom field enum options response */
export interface CustomFieldEnumOptionsResponse {
  custom_field_enum: CustomFieldEnumOption[];
}

/** Created enum option response */
export interface CreatedEnumOptionResponse {
  custom_field_enum: {
    uuid: string;
    value: string;
  };
}

/**
 * Custom Fields Resource class
 */
export class CustomFieldsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get custom field types
   * @returns Array of custom field types
   */
  async getTypes(): Promise<CustomFieldTypesResponse> {
    return this.http.get<CustomFieldTypesResponse>('/custom-field-types');
  }

  /**
   * Find custom fields by project
   * @param projectId - Project ID
   * @returns Custom fields for the project
   */
  async findByProject(projectId: number): Promise<CustomFieldsForProjectResponse> {
    return this.http.get<CustomFieldsForProjectResponse>(`/custom-field/find-by-project/${projectId}`);
  }

  /**
   * Create a custom field in a project
   * @param projectId - Project ID
   * @param data - Custom field creation data
   * @returns Created custom field
   */
  async create(projectId: number, data: CreateCustomFieldInput): Promise<CreateCustomFieldResponse> {
    return this.http.post<CreateCustomFieldResponse>(`/custom-field/create/${projectId}`, data);
  }

  /**
   * Rename a custom field
   * @param uuid - Custom field UUID
   * @param name - New name
   * @returns Updated custom field
   */
  async rename(uuid: string, name: string): Promise<CreateCustomFieldResponse> {
    return this.http.post<CreateCustomFieldResponse>(`/custom-field/rename/${uuid}`, { name });
  }

  /**
   * Delete a custom field
   * @param uuid - Custom field UUID
   * @returns Success response
   */
  async delete(uuid: string): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/custom-field/delete/${uuid}`);
  }

  /**
   * Restore a deleted custom field
   * @param uuid - Custom field UUID
   * @returns Restored custom field
   */
  async restore(uuid: string): Promise<CreateCustomFieldResponse> {
    return this.http.post<CreateCustomFieldResponse>(`/custom-field/restore/${uuid}`);
  }

  /**
   * Add or edit custom field value for a task
   * @param customFieldUuid - Custom field UUID
   * @param taskId - Task ID
   * @param value - Value to set
   * @returns Custom field value
   */
  async setValue(
    customFieldUuid: string,
    taskId: number,
    value: string
  ): Promise<CustomFieldValueResponse> {
    return this.http.post<CustomFieldValueResponse>('/custom-field/add-or-edit-value', {
      custom_field_uuid: customFieldUuid,
      task_id: taskId,
      value,
    });
  }

  /**
   * Add or edit enum value for a task
   * @param customFieldUuid - Custom field UUID
   * @param taskId - Task ID
   * @param enumOptionUuid - Enum option UUID
   * @returns Custom field enum value
   */
  async setEnumValue(
    customFieldUuid: string,
    taskId: number,
    enumOptionUuid: string
  ): Promise<CustomFieldEnumValueResponse> {
    return this.http.post<CustomFieldEnumValueResponse>('/custom-field/add-or-edit-enum-value', {
      customFieldUuid,
      task_id: taskId,
      value: enumOptionUuid,
    });
  }

  /**
   * Delete custom field value
   * @param valueUuid - Custom field value UUID
   * @returns Success response
   */
  async deleteValue(valueUuid: string): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/custom-field/delete-value/${valueUuid}`);
  }

  // ==================== ENUM OPTIONS ====================

  /**
   * Get enum options for a custom field
   * @param customFieldUuid - Custom field UUID
   * @returns Enum options
   */
  async getEnumOptions(customFieldUuid: string): Promise<CustomFieldEnumOptionsResponse> {
    return this.http.get<CustomFieldEnumOptionsResponse>(
      `/custom-field-enum/get-for-custom-field/${customFieldUuid}`
    );
  }

  /**
   * Create enum option for a custom field
   * @param customFieldUuid - Custom field UUID
   * @param value - Option value
   * @param uuid - Optional predefined UUID
   * @returns Created enum option
   */
  async createEnumOption(
    customFieldUuid: string,
    value: string,
    uuid?: string
  ): Promise<CreatedEnumOptionResponse> {
    return this.http.post<CreatedEnumOptionResponse>(
      `/custom-field-enum/create/${customFieldUuid}`,
      { value, uuid }
    );
  }

  /**
   * Edit enum option
   * @param enumUuid - Enum option UUID
   * @param value - New value
   * @returns Updated enum option
   */
  async editEnumOption(enumUuid: string, value: string): Promise<CreatedEnumOptionResponse> {
    return this.http.post<CreatedEnumOptionResponse>(`/custom-field-enum/change/${enumUuid}`, {
      value,
    });
  }

  /**
   * Delete enum option (fails if in use)
   * @param enumUuid - Enum option UUID
   * @returns Success response
   */
  async deleteEnumOption(enumUuid: string): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/custom-field-enum/delete/${enumUuid}`);
  }

  /**
   * Force delete enum option (even if in use)
   * @param enumUuid - Enum option UUID
   * @returns Success response
   */
  async forceDeleteEnumOption(enumUuid: string): Promise<SuccessResponse> {
    return this.http.delete<SuccessResponse>(`/custom-field-enum/force-delete/${enumUuid}`);
  }
}
