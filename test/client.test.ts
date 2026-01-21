import { describe, it, expect } from 'vitest';
import { Freelo } from '../src/index.js';

describe('Freelo Client', () => {
  const validConfig = {
    email: 'test@example.com',
    apiKey: 'test-api-key',
    userAgent: 'TestApp/1.0 (test@example.com)',
  };

  describe('constructor', () => {
    it('should create client with required config', () => {
      const client = new Freelo(validConfig);

      expect(client).toBeDefined();
      expect(client.projects).toBeDefined();
      expect(client.tasklists).toBeDefined();
      expect(client.tasks).toBeDefined();
      expect(client.subtasks).toBeDefined();
      expect(client.comments).toBeDefined();
      expect(client.timeTracking).toBeDefined();
      expect(client.workReports).toBeDefined();
      expect(client.users).toBeDefined();
      expect(client.files).toBeDefined();
      expect(client.search).toBeDefined();
      expect(client.notifications).toBeDefined();
      expect(client.events).toBeDefined();
      expect(client.customFields).toBeDefined();
      expect(client.notes).toBeDefined();
      expect(client.invoicing).toBeDefined();
      expect(client.states).toBeDefined();
    });

    it('should throw error when email is missing', () => {
      expect(() => {
        new Freelo({
          email: '',
          apiKey: 'test-api-key',
          userAgent: 'TestApp/1.0',
        });
      }).toThrow('Freelo config: email is required');
    });

    it('should throw error when apiKey is missing', () => {
      expect(() => {
        new Freelo({
          email: 'test@example.com',
          apiKey: '',
          userAgent: 'TestApp/1.0',
        });
      }).toThrow('Freelo config: apiKey is required');
    });

    it('should throw error when userAgent is missing', () => {
      expect(() => {
        new Freelo({
          email: 'test@example.com',
          apiKey: 'test-api-key',
          userAgent: '',
        });
      }).toThrow('Freelo config: userAgent is required');
    });

    it('should accept custom base URL', () => {
      const client = new Freelo({
        ...validConfig,
        baseUrl: 'https://custom.api.com/v1',
      });

      expect(client).toBeDefined();
    });

    it('should accept custom timeout', () => {
      const client = new Freelo({
        ...validConfig,
        timeout: 60000,
      });

      expect(client).toBeDefined();
    });
  });

  describe('resource namespaces', () => {
    it('should have projects resource', () => {
      const client = new Freelo(validConfig);
      expect(client.projects).toBeDefined();
      expect(typeof client.projects.list).toBe('function');
      expect(typeof client.projects.get).toBe('function');
      expect(typeof client.projects.create).toBe('function');
      expect(typeof client.projects.delete).toBe('function');
    });

    it('should have tasks resource', () => {
      const client = new Freelo(validConfig);
      expect(client.tasks).toBeDefined();
      expect(typeof client.tasks.list).toBe('function');
      expect(typeof client.tasks.get).toBe('function');
      expect(typeof client.tasks.create).toBe('function');
    });

    it('should have tasklists resource', () => {
      const client = new Freelo(validConfig);
      expect(client.tasklists).toBeDefined();
      expect(typeof client.tasklists.list).toBe('function');
      expect(typeof client.tasklists.get).toBe('function');
      expect(typeof client.tasklists.create).toBe('function');
    });

    it('should have subtasks resource', () => {
      const client = new Freelo(validConfig);
      expect(client.subtasks).toBeDefined();
      expect(typeof client.subtasks.list).toBe('function');
      expect(typeof client.subtasks.create).toBe('function');
    });

    it('should have comments resource', () => {
      const client = new Freelo(validConfig);
      expect(client.comments).toBeDefined();
      expect(typeof client.comments.list).toBe('function');
      expect(typeof client.comments.create).toBe('function');
    });

    it('should have timeTracking resource', () => {
      const client = new Freelo(validConfig);
      expect(client.timeTracking).toBeDefined();
      expect(typeof client.timeTracking.start).toBe('function');
      expect(typeof client.timeTracking.stop).toBe('function');
    });

    it('should have workReports resource', () => {
      const client = new Freelo(validConfig);
      expect(client.workReports).toBeDefined();
      expect(typeof client.workReports.list).toBe('function');
      expect(typeof client.workReports.create).toBe('function');
    });

    it('should have users resource', () => {
      const client = new Freelo(validConfig);
      expect(client.users).toBeDefined();
      expect(typeof client.users.list).toBe('function');
      expect(typeof client.users.inviteToProjects).toBe('function');
    });

    it('should have files resource', () => {
      const client = new Freelo(validConfig);
      expect(client.files).toBeDefined();
      expect(typeof client.files.list).toBe('function');
      expect(typeof client.files.upload).toBe('function');
    });

    it('should have search resource', () => {
      const client = new Freelo(validConfig);
      expect(client.search).toBeDefined();
      expect(typeof client.search.search).toBe('function');
    });

    it('should have notifications resource', () => {
      const client = new Freelo(validConfig);
      expect(client.notifications).toBeDefined();
      expect(typeof client.notifications.list).toBe('function');
    });

    it('should have events resource', () => {
      const client = new Freelo(validConfig);
      expect(client.events).toBeDefined();
      expect(typeof client.events.list).toBe('function');
    });

    it('should have customFields resource', () => {
      const client = new Freelo(validConfig);
      expect(client.customFields).toBeDefined();
      expect(typeof client.customFields.getTypes).toBe('function');
    });

    it('should have notes resource', () => {
      const client = new Freelo(validConfig);
      expect(client.notes).toBeDefined();
      expect(typeof client.notes.get).toBe('function');
      expect(typeof client.notes.create).toBe('function');
    });

    it('should have invoicing resource', () => {
      const client = new Freelo(validConfig);
      expect(client.invoicing).toBeDefined();
      expect(typeof client.invoicing.list).toBe('function');
      expect(typeof client.invoicing.get).toBe('function');
    });

    it('should have states resource', () => {
      const client = new Freelo(validConfig);
      expect(client.states).toBeDefined();
      expect(typeof client.states.list).toBe('function');
    });
  });
});
