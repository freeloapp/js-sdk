import { describe, it, expect } from 'vitest';
import {
  isFreeloError,
  isRateLimited,
  isUnauthorized,
  isNotFound,
} from '../src/errors';

describe('Error utilities', () => {
  describe('isFreeloError', () => {
    it('returns true for object with message', () => {
      expect(isFreeloError({ message: 'Something went wrong' })).toBe(true);
    });

    it('returns true for object with errors', () => {
      expect(
        isFreeloError({ errors: { name: ['Name is required'] } }),
      ).toBe(true);
    });

    it('returns true for object with code', () => {
      expect(isFreeloError({ code: 422 })).toBe(true);
    });

    it('returns true for object with message and code', () => {
      expect(
        isFreeloError({ message: 'Not Found', code: 404 }),
      ).toBe(true);
    });

    it('returns false for null', () => {
      expect(isFreeloError(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isFreeloError(undefined)).toBe(false);
    });

    it('returns false for string', () => {
      expect(isFreeloError('error')).toBe(false);
    });

    it('returns false for number', () => {
      expect(isFreeloError(500)).toBe(false);
    });

    it('returns false for empty object', () => {
      expect(isFreeloError({})).toBe(false);
    });
  });

  describe('isRateLimited', () => {
    it('returns true for 429 code', () => {
      expect(isRateLimited({ code: 429, message: 'Too Many Requests' })).toBe(
        true,
      );
    });

    it('returns false for other codes', () => {
      expect(isRateLimited({ code: 200 })).toBe(false);
      expect(isRateLimited({ code: 500 })).toBe(false);
    });

    it('returns false for non-error values', () => {
      expect(isRateLimited(null)).toBe(false);
      expect(isRateLimited('error')).toBe(false);
    });
  });

  describe('isUnauthorized', () => {
    it('returns true for 401 code', () => {
      expect(
        isUnauthorized({ code: 401, message: 'Unauthorized' }),
      ).toBe(true);
    });

    it('returns false for other codes', () => {
      expect(isUnauthorized({ code: 403 })).toBe(false);
    });
  });

  describe('isNotFound', () => {
    it('returns true for 404 code', () => {
      expect(isNotFound({ code: 404, message: 'Not Found' })).toBe(true);
    });

    it('returns false for other codes', () => {
      expect(isNotFound({ code: 500 })).toBe(false);
    });
  });
});
