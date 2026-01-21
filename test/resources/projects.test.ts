import { describe, it, expect, beforeEach } from 'vitest';
import { ProjectsResource } from '../../src/resources/projects.js';
import {
  createMockHttpClient,
  mockProject,
  mockProjectFull,
  mockProjectDetail,
  mockProjectBasic,
  mockSuccessResponse,
  mockPaginatedResponse,
  mockUser,
  type MockHttpClient,
} from '../mocks/http-client.js';

describe('ProjectsResource', () => {
  let httpClient: MockHttpClient;
  let projects: ProjectsResource;

  beforeEach(() => {
    httpClient = createMockHttpClient();
    projects = new ProjectsResource(httpClient as any);
  });

  describe('list', () => {
    it('should fetch projects list', async () => {
      httpClient.get.mockResolvedValue([mockProject]);

      const result = await projects.list();

      expect(httpClient.get).toHaveBeenCalledWith('/projects', {
        order_by: undefined,
        order: undefined,
      });
      expect(result).toEqual([mockProject]);
    });

    it('should pass sorting options', async () => {
      httpClient.get.mockResolvedValue([mockProject]);

      await projects.list({ order_by: 'name', order: 'asc' });

      expect(httpClient.get).toHaveBeenCalledWith('/projects', {
        order_by: 'name',
        order: 'asc',
      });
    });
  });

  describe('listAll', () => {
    it('should fetch all projects with pagination', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { projects: [mockProjectFull] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.listAll({ page: 2 });

      expect(httpClient.get).toHaveBeenCalledWith('/all-projects', expect.objectContaining({
        p: 2,
      }));
      expect(result.data.projects).toEqual([mockProjectFull]);
    });

    it('should pass filter options', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { projects: [mockProjectFull] },
      };
      httpClient.get.mockResolvedValue(response);

      await projects.listAll({
        tags: ['urgent', 'important'],
        states_ids: [1, 2],
        users_ids: [1],
        created_in_range: { date_from: '2024-01-01', date_to: '2024-12-31' },
      });

      expect(httpClient.get).toHaveBeenCalledWith('/all-projects', expect.objectContaining({
        tags: ['urgent', 'important'],
        states_ids: [1, 2],
        users_ids: [1],
        'created_in_range[date_from]': '2024-01-01',
        'created_in_range[date_to]': '2024-12-31',
      }));
    });
  });

  describe('listInvited', () => {
    it('should fetch invited projects', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { invited_projects: [mockProject] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.listInvited(1);

      expect(httpClient.get).toHaveBeenCalledWith('/invited-projects', { p: 1 });
      expect(result.data.invited_projects).toEqual([mockProject]);
    });
  });

  describe('listArchived', () => {
    it('should fetch archived projects', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { archived_projects: [mockProject] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.listArchived(1);

      expect(httpClient.get).toHaveBeenCalledWith('/archived-projects', { p: 1 });
      expect(result.data.archived_projects).toEqual([mockProject]);
    });
  });

  describe('listTemplates', () => {
    it('should fetch template projects', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { template_projects: [mockProject] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.listTemplates();

      expect(httpClient.get).toHaveBeenCalledWith('/template-projects', expect.any(Object));
      expect(result.data.template_projects).toEqual([mockProject]);
    });
  });

  describe('listByUser', () => {
    it('should fetch projects for a specific user', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { projects: [mockProjectFull] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.listByUser(1);

      expect(httpClient.get).toHaveBeenCalledWith('/user/1/all-projects', expect.any(Object));
      expect(result.data.projects).toEqual([mockProjectFull]);
    });
  });

  describe('get', () => {
    it('should fetch single project by ID', async () => {
      httpClient.get.mockResolvedValue(mockProjectDetail);

      const result = await projects.get(123);

      expect(httpClient.get).toHaveBeenCalledWith('/project/123');
      expect(result).toEqual(mockProjectDetail);
    });
  });

  describe('create', () => {
    it('should create a new project', async () => {
      httpClient.post.mockResolvedValue(mockProjectBasic);

      const result = await projects.create({
        name: 'New Project',
        currency_iso: 'CZK',
      });

      expect(httpClient.post).toHaveBeenCalledWith('/projects', {
        name: 'New Project',
        currency_iso: 'CZK',
      });
      expect(result).toEqual(mockProjectBasic);
    });

    it('should create project with owner', async () => {
      httpClient.post.mockResolvedValue(mockProjectBasic);

      await projects.create({
        name: 'New Project',
        currency_iso: 'EUR',
        project_owner_id: 1,
      });

      expect(httpClient.post).toHaveBeenCalledWith('/projects', {
        name: 'New Project',
        currency_iso: 'EUR',
        project_owner_id: 1,
      });
    });
  });

  describe('createFromTemplate', () => {
    it('should create project from template', async () => {
      httpClient.post.mockResolvedValue(mockProjectBasic);

      const result = await projects.createFromTemplate(100, 'Project from Template');

      expect(httpClient.post).toHaveBeenCalledWith('/project/create-from-template/100', {
        name: 'Project from Template',
      });
      expect(result).toEqual(mockProjectBasic);
    });

    it('should create project from template with options', async () => {
      httpClient.post.mockResolvedValue(mockProjectBasic);

      await projects.createFromTemplate(100, 'Project from Template', {
        general_settings: {
          due_date_forward: true,
          due_date_forward_count: 7,
          due_date_forward_unit: 'days',
        },
      });

      expect(httpClient.post).toHaveBeenCalledWith('/project/create-from-template/100', {
        name: 'Project from Template',
        general_settings: {
          due_date_forward: true,
          due_date_forward_count: 7,
          due_date_forward_unit: 'days',
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete a project', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await projects.delete(123);

      expect(httpClient.delete).toHaveBeenCalledWith('/project/123');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('archive', () => {
    it('should archive a project', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.archive(123);

      expect(httpClient.post).toHaveBeenCalledWith('/project/123/archive');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('activate', () => {
    it('should activate an archived project', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.activate(123);

      expect(httpClient.post).toHaveBeenCalledWith('/project/123/activate');
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('getWorkers', () => {
    it('should fetch project workers', async () => {
      const response = {
        ...mockPaginatedResponse,
        data: { workers: [mockUser] },
      };
      httpClient.get.mockResolvedValue(response);

      const result = await projects.getWorkers(123);

      expect(httpClient.get).toHaveBeenCalledWith('/project/123/workers', { p: undefined });
      expect(result.data.workers).toEqual([mockUser]);
    });
  });

  describe('removeWorkersByIds', () => {
    it('should remove workers by IDs', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.removeWorkersByIds(123, [1, 2, 3]);

      expect(httpClient.post).toHaveBeenCalledWith('/project/123/remove-workers/by-ids', {
        users_ids: [1, 2, 3],
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('removeWorkersByEmails', () => {
    it('should remove workers by emails', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.removeWorkersByEmails(123, ['user1@test.com', 'user2@test.com']);

      expect(httpClient.post).toHaveBeenCalledWith('/project/123/remove-workers/by-emails', {
        emails: ['user1@test.com', 'user2@test.com'],
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('labels', () => {
    const mockLabel = {
      id: 1,
      name: 'Important',
      color: '#ff0000',
      is_private: false,
      users_id: 1,
      usage_count: 5,
      can_be_public: true,
      can_be_edited: true,
    };

    it('should get project labels', async () => {
      httpClient.get.mockResolvedValue([mockLabel]);

      const result = await projects.getLabels();

      expect(httpClient.get).toHaveBeenCalledWith('/project-labels');
      expect(result).toEqual([mockLabel]);
    });

    it('should create project label', async () => {
      httpClient.post.mockResolvedValue(mockLabel);

      const result = await projects.createLabel('Important', '#ff0000');

      expect(httpClient.post).toHaveBeenCalledWith('/project-labels', {
        name: 'Important',
        color: '#ff0000',
      });
      expect(result).toEqual(mockLabel);
    });

    it('should edit project label', async () => {
      httpClient.post.mockResolvedValue(mockLabel);

      const result = await projects.editLabel(1, { name: 'Updated', color: '#00ff00' });

      expect(httpClient.post).toHaveBeenCalledWith('/project-labels/1', {
        name: 'Updated',
        color: '#00ff00',
      });
      expect(result).toEqual(mockLabel);
    });

    it('should add label to project', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.addLabelToProject(123, 1);

      expect(httpClient.post).toHaveBeenCalledWith('/project-labels/add-to-project/123', {
        label_id: 1,
      });
      expect(result).toEqual(mockSuccessResponse);
    });

    it('should remove label from project', async () => {
      httpClient.post.mockResolvedValue(mockSuccessResponse);

      const result = await projects.removeLabelFromProject(123, 1);

      expect(httpClient.post).toHaveBeenCalledWith('/project-labels/remove-from-project/123', {
        label_id: 1,
      });
      expect(result).toEqual(mockSuccessResponse);
    });
  });

  describe('pinned items', () => {
    const mockPinnedItem = {
      id: 1,
      link: 'https://example.com',
      title: 'Example Link',
    };

    it('should get pinned items', async () => {
      httpClient.get.mockResolvedValue([mockPinnedItem]);

      const result = await projects.getPinnedItems(123);

      expect(httpClient.get).toHaveBeenCalledWith('/project/123/pinned-items');
      expect(result).toEqual([mockPinnedItem]);
    });

    it('should create pinned item', async () => {
      httpClient.post.mockResolvedValue(mockPinnedItem);

      const result = await projects.createPinnedItem(123, {
        link: 'https://example.com',
        title: 'Example Link',
      });

      expect(httpClient.post).toHaveBeenCalledWith('/project/123/pinned-items', {
        link: 'https://example.com',
        title: 'Example Link',
      });
      expect(result).toEqual(mockPinnedItem);
    });

    it('should delete pinned item', async () => {
      httpClient.delete.mockResolvedValue(mockSuccessResponse);

      const result = await projects.deletePinnedItem(1);

      expect(httpClient.delete).toHaveBeenCalledWith('/pinned-items/1');
      expect(result).toEqual(mockSuccessResponse);
    });
  });
});
