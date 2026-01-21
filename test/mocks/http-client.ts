import { vi } from 'vitest';
import type { HttpClient, FileUploadResponse } from '../../src/http.js';

/**
 * Create a mock HTTP client for testing
 */
export function createMockHttpClient(): MockHttpClient {
  return {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
    uploadFile: vi.fn(),
    requestWithRetry: vi.fn(),
  };
}

export interface MockHttpClient {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  request: ReturnType<typeof vi.fn>;
  uploadFile: ReturnType<typeof vi.fn>;
  requestWithRetry: ReturnType<typeof vi.fn>;
}

// Mock data for testing

export const mockUser = {
  id: 1,
  fullname: 'John Doe',
};

export const mockState = {
  id: 1,
  state: 'active' as const,
};

export const mockCurrency = {
  amount: '100000',
  currency: 'CZK' as const,
};

export const mockTasklistBasic = {
  id: 101,
  name: 'Test Tasklist',
};

export const mockProjectBasic = {
  id: 123,
  name: 'Test Project',
};

export const mockProject = {
  ...mockProjectBasic,
  date_add: '2024-01-01T10:00:00+01:00',
  date_edited_at: '2024-01-15T14:30:00+01:00',
  tasklists: [mockTasklistBasic],
};

export const mockProjectFull = {
  ...mockProject,
  owner: mockUser,
  state: mockState,
  minutes_budget: 6000,
  budget: mockCurrency,
  real_minutes_spent: 2400,
  real_cost: { amount: '40000', currency: 'CZK' as const },
};

export const mockProjectDetail = {
  ...mockProjectFull,
  tasklists: [{
    id: 101,
    name: 'Test Tasklist',
    tasks: [{
      id: 456,
      name: 'Test Task',
      due_date: '2024-12-31',
      due_date_end: null,
      worker: mockUser,
      parent_task_id: null,
    }],
  }],
  workers: [{
    ...mockUser,
    hour_rate: {
      amount: 1000,
      currency: 'CZK' as const,
      is_fixed: false,
    },
  }],
};

export const mockTaskLabel = {
  uuid: 'label-uuid-123',
  name: 'Bug',
  color: '#ff0000',
};

export const mockTask = {
  id: 456,
  name: 'Test Task',
  date_add: '2024-01-10T10:00:00+01:00',
  date_edited_at: '2024-01-15T14:30:00+01:00',
  due_date: '2024-12-31',
  due_date_end: null,
  count_comments: 2,
  count_subtasks: 3,
  author: mockUser,
  worker: mockUser,
  labels: [mockTaskLabel],
  parent_task_id: null,
  state: mockState,
  project: { ...mockProjectBasic, state: mockState },
  tasklist: { ...mockTasklistBasic, state: mockState },
};

export const mockTaskDetail = {
  id: 456,
  name: 'Test Task',
  date_add: '2024-01-10T10:00:00+01:00',
  date_edited_at: '2024-01-15T14:30:00+01:00',
  due_date: '2024-12-31',
  due_date_end: null,
  date_finished: null,
  minutes: 120,
  priority_enum: 'm',
  count_subtasks: 3,
  parent_task_id: null,
  cost: mockCurrency,
  author: mockUser,
  worker: mockUser,
  state: mockState,
  comments: [],
  labels: [mockTaskLabel],
  project: mockProjectBasic,
  tasklist: mockTasklistBasic,
};

export const mockTaskCreated = {
  id: 789,
  name: 'New Task',
  date_add: '2024-01-20T10:00:00+01:00',
  due_date: '2024-02-01',
  due_date_end: null,
  worker: mockUser,
  priority_enum: 'm',
  labels: [],
  tracking_users: [mockUser],
  subtasks: [],
};

export const mockTasklist = {
  ...mockTasklistBasic,
  date_add: '2024-01-01T10:00:00+01:00',
  date_edited_at: '2024-01-15T14:30:00+01:00',
  state: mockState,
  project: { ...mockProjectBasic, state: mockState },
  real_minutes_spent: 600,
  budget: mockCurrency,
  real_cost: { amount: '10000', currency: 'CZK' as const },
};

export const mockSubtask = {
  id: 1001,
  task_id: 456,
  name: 'Test Subtask',
  date_add: '2024-01-10T10:00:00+01:00',
  due_date: '2024-12-25',
  due_date_end: null,
  count_comments: 0,
  count_subtasks: 0,
  author: mockUser,
  worker: mockUser,
  state: mockState,
  project: { ...mockProjectBasic, state: mockState },
  tasklist: { ...mockTasklistBasic, state: mockState },
  labels: [],
};

export const mockComment = {
  id: 2001,
  content: 'Test comment content',
  date_add: '2024-01-15T10:00:00+01:00',
  author: mockUser,
  is_description: false,
  files: [],
};

export const mockWorkReport = {
  id: 3001,
  date_add: '2024-01-15T10:00:00+01:00',
  date_reported: '2024-01-15',
  note: 'Test work report',
  minutes: 60,
  cost: mockCurrency,
  author: mockUser,
  worker: mockUser,
  task: { id: 456, name: 'Test Task' },
};

export const mockNotification = {
  id: 4001,
  type: 'comment',
  date_action: '2024-01-15T10:00:00+01:00',
  author: mockUser,
  who: mockUser,
  is_unread: true,
  is_new: true,
  task: { id: 456, name: 'Test Task' },
  tasklist: mockTasklistBasic,
  project: mockProjectBasic,
  more_comments: false,
  more_users: [],
};

export const mockEvent = {
  id: 5001,
  date_action: '2024-01-15T10:00:00+01:00',
  type: 'task_add',
  author: mockUser,
  who: mockUser,
  task: { id: 456, name: 'Test Task' },
  tasklist: mockTasklistBasic,
  project: mockProjectBasic,
  due_date: null,
  due_date_end: null,
};

export const mockSearchResult = {
  score: 0.95,
  id: 456,
  uuid: null,
  name: 'Test Task',
  author_id: 1,
  type: 'task' as const,
  highlight_name: ['<em>Test</em> Task'],
  highlight_content: [],
};

export const mockSuccessResponse = {
  result: 'success',
};

export const mockPaginatedResponse = {
  total: 100,
  count: 10,
  page: 1,
  per_page: 10,
};

export const mockFileUploadResponse: FileUploadResponse = {
  uuid: 'file-uuid-123',
  download_url: 'https://api.freelo.io/file/download/file-uuid-123',
  filename: 'test-file.pdf',
};
