import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  toApi,
  toApiWithTime,
  toApiWithLocalTime,
  fromApi,
  isValid,
  today,
  daysFromNow,
  weeksFromNow,
  monthsFromNow,
  range,
} from '../../src/utils/dates.js';

describe('dates utilities', () => {
  describe('toApi', () => {
    it('should convert Date to YYYY-MM-DD format', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      expect(toApi(date)).toBe('2024-01-15');
    });

    it('should pad single digit months and days', () => {
      const date = new Date(2024, 5, 5); // June 5, 2024
      expect(toApi(date)).toBe('2024-06-05');
    });

    it('should handle end of year', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      expect(toApi(date)).toBe('2024-12-31');
    });
  });

  describe('toApiWithTime', () => {
    it('should convert Date to ISO 8601 format', () => {
      const date = new Date('2024-01-15T10:30:00.000Z');
      expect(toApiWithTime(date)).toBe('2024-01-15T10:30:00.000Z');
    });
  });

  describe('toApiWithLocalTime', () => {
    it('should convert Date to ISO 8601 with local timezone', () => {
      const date = new Date(2024, 0, 15, 10, 30, 0);
      const result = toApiWithLocalTime(date);

      // Should match format YYYY-MM-DDTHH:MM:SS+HH:MM
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
      expect(result).toContain('2024-01-15');
      expect(result).toContain('10:30:00');
    });
  });

  describe('fromApi', () => {
    it('should parse date-only string', () => {
      const date = fromApi('2024-01-15');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January
      expect(date.getDate()).toBe(15);
    });

    it('should parse datetime string', () => {
      const date = fromApi('2024-01-15T10:30:00+01:00');
      expect(date.getFullYear()).toBe(2024);
    });

    it('should parse ISO 8601 format', () => {
      const date = fromApi('2024-01-15T10:30:00.000Z');
      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).not.toBeNaN();
    });

    it('should throw error for invalid date', () => {
      expect(() => fromApi('invalid')).toThrow('Invalid date value: invalid');
      expect(() => fromApi('')).toThrow('Invalid date value: ');
    });
  });

  describe('isValid', () => {
    it('should return true for valid dates', () => {
      expect(isValid('2024-01-15')).toBe(true);
      expect(isValid('2024-01-15T10:30:00+01:00')).toBe(true);
      expect(isValid('2024-01-15T10:30:00.000Z')).toBe(true);
    });

    it('should return false for invalid dates', () => {
      expect(isValid('invalid')).toBe(false);
      expect(isValid('2024-13-01')).toBe(false); // Invalid month
      expect(isValid('')).toBe(false);
    });
  });

  describe('today', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return today in API format', () => {
      expect(today()).toBe('2024-06-15');
    });
  });

  describe('daysFromNow', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date N days in the future', () => {
      expect(daysFromNow(7)).toBe('2024-06-22');
      expect(daysFromNow(1)).toBe('2024-06-16');
    });

    it('should return date N days in the past', () => {
      expect(daysFromNow(-7)).toBe('2024-06-08');
      expect(daysFromNow(-15)).toBe('2024-05-31');
    });

    it('should return today for 0 days', () => {
      expect(daysFromNow(0)).toBe('2024-06-15');
    });
  });

  describe('weeksFromNow', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date N weeks in the future', () => {
      expect(weeksFromNow(1)).toBe('2024-06-22');
      expect(weeksFromNow(2)).toBe('2024-06-29');
    });

    it('should return date N weeks in the past', () => {
      expect(weeksFromNow(-1)).toBe('2024-06-08');
      expect(weeksFromNow(-2)).toBe('2024-06-01');
    });
  });

  describe('monthsFromNow', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 5, 15)); // June 15, 2024
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return date N months in the future', () => {
      expect(monthsFromNow(1)).toBe('2024-07-15');
      expect(monthsFromNow(6)).toBe('2024-12-15');
    });

    it('should return date N months in the past', () => {
      expect(monthsFromNow(-1)).toBe('2024-05-15');
      expect(monthsFromNow(-6)).toBe('2023-12-15');
    });

    it('should handle year boundary', () => {
      expect(monthsFromNow(7)).toBe('2025-01-15');
    });
  });

  describe('range', () => {
    it('should create date range object', () => {
      const dateFrom = new Date(2024, 0, 1);
      const dateTo = new Date(2024, 11, 31);

      const result = range(dateFrom, dateTo);

      expect(result).toEqual({
        date_from: '2024-01-01',
        date_to: '2024-12-31',
      });
    });
  });


  describe('round-trip conversion', () => {
    it('should preserve date through round-trip', () => {
      const original = new Date(2024, 5, 15);
      const apiFormat = toApi(original);
      const parsed = fromApi(apiFormat);

      expect(parsed.getFullYear()).toBe(original.getFullYear());
      expect(parsed.getMonth()).toBe(original.getMonth());
      expect(parsed.getDate()).toBe(original.getDate());
    });
  });
});
