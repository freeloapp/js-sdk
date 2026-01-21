import { describe, it, expect } from 'vitest';
import { currency, toApi, fromApi, format, formatFromApi } from '../../src/utils/currency.js';

describe('currency utilities', () => {
  describe('toApi', () => {
    it('should convert whole numbers to API format', () => {
      expect(toApi(1000)).toBe('100000');
      expect(toApi(1)).toBe('100');
      expect(toApi(0)).toBe('0');
    });

    it('should convert decimal numbers to API format', () => {
      expect(toApi(1000.25)).toBe('100025');
      expect(toApi(1000.50)).toBe('100050');
      expect(toApi(0.01)).toBe('1');
      expect(toApi(0.99)).toBe('99');
    });

    it('should handle floating point precision', () => {
      expect(toApi(1000.255)).toBe('100026'); // Rounded
      expect(toApi(1000.254)).toBe('100025'); // Rounded
    });

    it('should handle negative values', () => {
      expect(toApi(-100)).toBe('-10000');
      expect(toApi(-100.50)).toBe('-10050');
    });
  });

  describe('fromApi', () => {
    it('should convert API format to decimal numbers', () => {
      expect(fromApi('100000')).toBe(1000);
      expect(fromApi('100')).toBe(1);
      expect(fromApi('0')).toBe(0);
    });

    it('should convert API format to decimal with cents', () => {
      expect(fromApi('100025')).toBe(1000.25);
      expect(fromApi('100050')).toBe(1000.50);
      expect(fromApi('1')).toBe(0.01);
      expect(fromApi('99')).toBe(0.99);
    });

    it('should handle negative values', () => {
      expect(fromApi('-10000')).toBe(-100);
      expect(fromApi('-10050')).toBe(-100.50);
    });

    it('should throw error for invalid input', () => {
      expect(() => fromApi('abc')).toThrow('Invalid currency value: abc');
      expect(() => fromApi('')).toThrow('Invalid currency value: ');
    });
  });

  describe('format', () => {
    it('should format CZK currency', () => {
      const formatted = format(1000.25, 'CZK');
      // Czech locale formats differ by environment
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });

    it('should format EUR currency', () => {
      const formatted = format(1000.25, 'EUR');
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });

    it('should format USD currency', () => {
      const formatted = format(1000.25, 'USD');
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });

    it('should accept custom locale', () => {
      const formatted = format(1000.25, 'USD', 'en-US');
      expect(formatted).toContain('$');
    });
  });

  describe('formatFromApi', () => {
    it('should convert and format in one step', () => {
      const formatted = formatFromApi('100025', 'CZK');
      expect(formatted).toContain('1');
      expect(formatted).toContain('000');
    });
  });

  describe('currency namespace', () => {
    it('should export all functions', () => {
      expect(currency.toApi).toBe(toApi);
      expect(currency.fromApi).toBe(fromApi);
      expect(currency.format).toBe(format);
      expect(currency.formatFromApi).toBe(formatFromApi);
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve value through round-trip', () => {
      const originalValues = [0, 1, 100, 1000.25, 99999.99];

      for (const value of originalValues) {
        const apiFormat = toApi(value);
        const converted = fromApi(apiFormat);
        expect(converted).toBe(value);
      }
    });
  });
});
