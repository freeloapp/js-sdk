import { describe, it, expect, beforeEach } from 'vitest';
import { TasksResource } from '../../src/resources/tasks.js';
import {
  createMockHttpClient,
  mockTask,
  mockTaskDetail,
  mockTaskCreated,
  mockTaskLabel,
  mockSuccessResponse,
  mockPaginatedResponse,
  type MockHttpClient,
} from '../mocks/http-client.js';

describe('TasksResource', () => {
  let httpClient: MockHttpClient;
  let tasks: TasksResource;

  beforeEach(() => {
    httpClient = createMockHttpClient();
    tasks = new TasksResource(httpClient as any);
  });

  describe('list', () => {
    it('should fetch all tasks', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { tasks: [mockTask] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await tasks.list();

      expect(httpClient.get).toHaveBeenCalledWith('/all-tasks', { p: undefined });
      expect(result.data.tasks).toEqual([mockTask]);
    });

    it('should fetch tasks with pagination', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { tasks: [mockTask] },
      };
      httpClient.get.mockResolvedValue(response);

      await tasks.list({ page: 2 });

      expect(httpClient.get).toHaveBeenCalledWith('/all-tasks', { p: 2 });
    });
  });

  describe('listFinished', () => {
    it('should fetch finished tasks', async () => {
      const mockFinishedTask = {
        ...mockTask,
        date_finished: '2024-01-20T10:00:00+01:00',
        finished_by: { id: 1, fullname: 'John Doe' },
      };
      const response = {
        ...mockPaginatedResponse,
        data: { finished_tasks: [mockFinishedTask] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await tasks.listFinished(1);

      expect(httpClient.get).toHaveBeenCalledWith('/finished-tasks', { p: 1 });
      expect(result.data.finished_tasks).toEqual([mockFinishedTask]);
    });
  });

  describe('listByTasklist', () => {
    it('should fetch tasks by tasklist', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { tasks: [mockTask] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await tasks.listByTasklist(101);

      expect(httpClient.get).toHaveBeenCalledWith('/tasklist/101/tasks', { p: undefined });
      expect(result.data.tasks).toEqual([mockTask]);
    });
  });

  describe('get', () => {
    it('should fetch single task by ID', async () => {
      httpClient.get.mockResolvedValue(mockTaskDetail);

      const result = await tasks.get(456);

      expect(httpClient.get).toHaveBeenCalledWith('/task/456');
      expect(result).toEqual(mockTaskDetail);
    });
  });

  describe('create', () => {
    it('should create a new task', async () => {
      httpClient.post.mockResolvedValue(mockTaskCreated);

      const result = await tasks.create(101, {
        name: 'New Task',
      });

      expect(httpClient.post).toHaveBeenCalledWith('/tasklist/101/tasks', {
        name: 'New Task',
      });
      expect(result).toEqual(mockTaskCreated);
    });

    it('should create task with all options', async () => {
      httpClient.post.mockResolvedValue(mockTaskCreated);

      await tasks.create(101, {
        name: 'New Task',
        due_date: '2024-12-31',
        due_date_end: '2025-01-05',
        worker: 1,
        priority_enum: 'h',
        comment: { content: 'Initial comment' },
        labels: [{ name: 'Bug', color: '#ff0000' }],
        tracking_users_ids: [1, 2],
        turn_off_authors_tracking: true,
        subtasks: [{ name: 'Subtask 1' }],
      });

      expect(httpClient.post).toHaveBeenCalledWith('/tasklist/101/tasks', {
        name: 'New Task',
        due_date: '2024-12-31',
        due_date_end: '2025-01-05',
        worker: 1,
        priority_enum: 'h',
        comment: { content: 'Initial comment' },
        labels: [{ name: 'Bug', color: '#ff0000' }],
        tracking_users_ids: [1, 2],
        turn_off_authors_tracking: true,
        subtasks: [{ name: 'Subtask 1' }],
      });
    });
  });

  describe('createFromTemplate', () => {
    it('should create task from template', async () => {
      httpClient.post.mockResolvedValue(mockTaskCreated);

      const result = await tasks.createFromTemplate(100, 101);

      expect(httpClient.post).toHaveBeenCalledWith('/task/create-from-template/100', {
        tasklist_id: 101,
      });
      expect(result).toEqual(mockTaskCreated);
    });

    it('should create task from template with options', async () => {
      httpClient.post.mockResolvedValue(mockTaskCreated);

      await tasks.createFromTemplate(100, 101, {
        name: 'Custom Name',
        general_settings: {
          due_date_forward: true,
          due_date_forward_count: 7,
          due_date_forward_unit: 'days',
        },
      });

      expect(httpClient.post).toHaveBeenCalledWith('/task/create-from-template/100', {
        tasklist_id: 101,
        name: 'Custom Name',
        general_settings: {
          due_date_forward: true,
          due_date_forward_count: 7,
          due_date_forward_unit: 'days',
        },
      });
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      httpClient.post.mockResolvedValue(mockTaskCreated);

      const result = await tasks.update(456, {
        name: 'Updated Task',
        due_date: '2025-01-15',
      });

      expect(httpClient.post).toHaveBeenCalledWith('/task/456', {
        name: 'Updated Task',
        due_date: '2025-01-15',
      });
      expect(result).toEqual(mockTaskCreated);
    });
  });

  describe('delete', () => {
    it('should delete a task', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.delete(456);

      expect(httpClient.delete).toHaveBeenCalledWith('/task/456');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('finish', () => {
    it('should finish a task', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.finish(456);

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/finish');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('activate', () => {
    it('should activate a finished task', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.activate(456);

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/activate');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('move', () => {
    it('should move task to another tasklist', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.move(456, 102);

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/move', {
        tasklist_id: 102,
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('setDescription', () => {
    it('should set task description', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.setDescription(456, 'Task description content');

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/description', {
        content: 'Task description content',
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('setReminder', () => {
    it('should set task reminder', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.setReminder(456, '2024-12-30T10:00:00+01:00');

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/reminder', {
        date_remind: '2024-12-30T10:00:00+01:00',
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('deleteReminder', () => {
    it('should delete task reminder', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.deleteReminder(456);

      expect(httpClient.delete).toHaveBeenCalledWith('/task/456/reminder');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('time estimates', () => {
    it('should set total time estimate', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.setTotalTimeEstimate(456, 120);

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/total-time-estimate', {
        minutes: 120,
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should delete total time estimate', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.deleteTotalTimeEstimate(456);

      expect(httpClient.delete).toHaveBeenCalledWith('/task/456/total-time-estimate');
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should set user time estimate', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.setUserTimeEstimate(456, 1, 60);

      expect(httpClient.post).toHaveBeenCalledWith('/task/456/users-time-estimates/1', {
        minutes: 60,
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should delete user time estimate', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.deleteUserTimeEstimate(456, 1);

      expect(httpClient.delete).toHaveBeenCalledWith('/task/456/users-time-estimates/1');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('task labels', () => {
    it('should get all task labels', async () => {
      httpClient.get.mockResolvedValue([mockTaskLabel]);

      const result = await tasks.getLabels();

      expect(httpClient.get).toHaveBeenCalledWith('/task-labels');
      expect(result).toEqual([mockTaskLabel]);
    });

    it('should create task labels', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.createLabels([
        { name: 'Bug', color: '#ff0000' },
        { name: 'Feature', color: '#00ff00' },
      ]);

      expect(httpClient.post).toHaveBeenCalledWith('/task-labels', {
        labels: [
          { name: 'Bug', color: '#ff0000' },
          { name: 'Feature', color: '#00ff00' },
        ],
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should add labels to task', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.addLabels(456, [{ uuid: 'label-uuid-123' }]);

      expect(httpClient.post).toHaveBeenCalledWith('/task-labels/add-to-task/456', {
        labels: [{ uuid: 'label-uuid-123' }],
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should remove labels from task', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await tasks.removeLabels(456, [{ uuid: 'label-uuid-123' }]);

      expect(httpClient.post).toHaveBeenCalledWith('/task-labels/remove-from-task/456', {
        labels: [{ uuid: 'label-uuid-123' }],
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });
});
