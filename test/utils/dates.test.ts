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
    // Build Date instances from explicit UTC instants (TZ-invariant inputs).
    // Output must be naive ISO 8601 in Europe/Prague — what API V1 expects.

    it('formats summer instant as Europe/Prague (CEST = UTC+2)', () => {
      // 2026-04-24T09:12:38Z === 11:12:38 in Prague (CEST)
      const d = new Date(Date.UTC(2026, 3, 24, 9, 12, 38));
      expect(toApiWithTime(d)).toBe('2026-04-24T11:12:38');
    });

    it('formats winter instant as Europe/Prague (CET = UTC+1)', () => {
      // 2026-01-15T09:30:00Z === 10:30:00 in Prague (CET)
      const d = new Date(Date.UTC(2026, 0, 15, 9, 30, 0));
      expect(toApiWithTime(d)).toBe('2026-01-15T10:30:00');
    });

    it('pads single-digit components', () => {
      // 2026-06-05T01:02:03Z === 03:02:03 in Prague (CEST)
      const d = new Date(Date.UTC(2026, 5, 5, 1, 2, 3));
      expect(toApiWithTime(d)).toBe('2026-06-05T03:02:03');
    });

    it('round-trips through fromApi', () => {
      const naive = '2026-04-24T11:12:38';
      expect(toApiWithTime(fromApi(naive))).toBe(naive);
    });

    it('round-trips a winter naive timestamp', () => {
      const naive = '2026-01-15T10:30:00';
      expect(toApiWithTime(fromApi(naive))).toBe(naive);
    });

    it('output never contains a timezone designator', () => {
      const out = toApiWithTime(new Date());
      expect(out).not.toContain('Z');
      expect(out).not.toMatch(/[+-]\d{2}:\d{2}$/);
      expect(out).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
    });
  });

  describe('toApiWithLocalTime', () => {
    it('produces the same naive Prague output as toApiWithTime', () => {
      const d = new Date(Date.UTC(2026, 3, 24, 9, 12, 38));
      expect(toApiWithLocalTime(d)).toBe(toApiWithTime(d));
      expect(toApiWithLocalTime(d)).toBe('2026-04-24T11:12:38');
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

  describe('fromApi — naive datetime (Europe/Prague)', () => {
    // API V1 returns naive datetime strings (no timezone designator) that
    // actually represent Europe/Prague local time. fromApi() must interpret
    // them as such regardless of the runtime's local timezone — assertions
    // use toISOString() which is TZ-invariant.

    it('parses naive summer datetime as Europe/Prague (CEST = UTC+2)', () => {
      expect(fromApi('2026-04-24T11:12:38').toISOString()).toBe('2026-04-24T09:12:38.000Z');
    });

    it('parses naive winter datetime as Europe/Prague (CET = UTC+1)', () => {
      expect(fromApi('2026-01-15T10:30:00').toISOString()).toBe('2026-01-15T09:30:00.000Z');
    });

    it('parses naive datetime with milliseconds', () => {
      expect(fromApi('2026-04-24T11:12:38.500').toISOString()).toBe(
        '2026-04-24T09:12:38.500Z'
      );
    });

    it('handles DST spring forward (non-existent wall time)', () => {
      // 2026-03-29 02:30 in Prague does not exist — clocks jump 02:00 CET → 03:00 CEST.
      // Defined behavior: input is treated with the pre-jump CET offset (+1h),
      // matching PHP DateTime semantics for non-existent wall times.
      expect(fromApi('2026-03-29T02:30:00').toISOString()).toBe('2026-03-29T01:30:00.000Z');
    });

    it('handles DST fall back (ambiguous wall time)', () => {
      // 2026-10-25 02:30 in Prague occurs twice. Defined behavior: the second
      // occurrence (post-jump CET, offset = +1h).
      expect(fromApi('2026-10-25T02:30:00').toISOString()).toBe('2026-10-25T01:30:00.000Z');
    });

    it('parses Prague wall time near DST boundary correctly', () => {
      // 01:30 CET on jump day must NOT be misinterpreted as CEST.
      expect(fromApi('2026-03-29T01:30:00').toISOString()).toBe('2026-03-29T00:30:00.000Z');
      // 03:30 CEST on jump day.
      expect(fromApi('2026-03-29T03:30:00').toISOString()).toBe('2026-03-29T01:30:00.000Z');
    });
  });

  describe('fromApi — backward compatibility', () => {
    it('parses Z-suffixed datetime as UTC', () => {
      expect(fromApi('2026-04-24T11:12:38Z').toISOString()).toBe('2026-04-24T11:12:38.000Z');
    });

    it('preserves explicit positive offset', () => {
      expect(fromApi('2026-04-24T11:12:38+01:00').toISOString()).toBe(
        '2026-04-24T10:12:38.000Z'
      );
    });

    it('preserves explicit negative offset', () => {
      expect(fromApi('2026-04-24T11:12:38-05:00').toISOString()).toBe(
        '2026-04-24T16:12:38.000Z'
      );
    });

    it('still parses date-only strings', () => {
      const d = fromApi('2024-01-15');
      expect(d.getTime()).not.toBeNaN();
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
