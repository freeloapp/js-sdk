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

    it('should create client without any config (lazy initialization)', () => {
      const client = new Freelo();
      expect(client).toBeDefined();
      expect(client.projects).toBeDefined();
    });

    it('should create client with partial config', () => {
      const client = new Freelo({ email: 'test@example.com' });
      expect(client).toBeDefined();
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

  describe('setCredentials', () => {
    it('should expose setCredentials method', () => {
      const client = new Freelo(validConfig);
      expect(typeof client.setCredentials).toBe('function');
    });

    it('should allow setting credentials after construction', () => {
      const client = new Freelo();
      expect(() => {
        client.setCredentials({
          email: 'new@example.com',
          apiKey: 'new-key',
          userAgent: 'NewApp/1.0',
        });
      }).not.toThrow();
    });

    it('should allow partial credential updates', () => {
      const client = new Freelo(validConfig);
      expect(() => {
        client.setCredentials({ apiKey: 'updated-key' });
      }).not.toThrow();
    });
  });

  describe('withCredentials', () => {
    it('should return a new Freelo instance', () => {
      const client = new Freelo(validConfig);
      const derived = client.withCredentials({ email: 'other@example.com', apiKey: 'other-key' });

      expect(derived).toBeInstanceOf(Freelo);
      expect(derived).not.toBe(client);
    });

    it('should have all resource namespaces on derived instance', () => {
      const client = new Freelo(validConfig);
      const derived = client.withCredentials({ apiKey: 'other-key' });

      expect(derived.projects).toBeDefined();
      expect(derived.tasks).toBeDefined();
      expect(derived.users).toBeDefined();
    });

    it('should allow partial credential overrides', () => {
      const client = new Freelo(validConfig);
      // Only override apiKey — email and userAgent should be inherited
      const derived = client.withCredentials({ apiKey: 'new-key' });

      expect(derived).toBeDefined();
      expect(typeof derived.setCredentials).toBe('function');
    });
  });

  describe('call', () => {
    it('should expose call method', () => {
      const client = new Freelo(validConfig);
      expect(typeof client.call).toBe('function');
    });

    it('should be available on withCredentials instances', () => {
      const client = new Freelo(validConfig);
      const derived = client.withCredentials({ apiKey: 'other-key' });
      expect(typeof derived.call).toBe('function');
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
