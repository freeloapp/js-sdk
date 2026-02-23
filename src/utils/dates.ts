/**
 * Date Utilities
 * Helpers for converting between API format and JavaScript Date objects
 *
 * The Freelo API uses ISO 8601 date formats:
 * - Date only: "2024-01-15"
 * - Date with time: "2024-01-15T10:30:00+01:00"
 *
 * @example
 * ```typescript
 * import { dates } from '@freeloapp/js-sdk';
 *
 * // Format for API (date only)
 * dates.toApi(new Date()); // "2024-01-15"
 *
 * // Format for API (with time)
 * dates.toApiWithTime(new Date()); // "2024-01-15T10:30:00+01:00"
 *
 * // Parse from API
 * dates.fromApi("2024-01-15T10:30:00+01:00"); // Date object
 * ```
 */

/**
 * Convert a JavaScript Date to API date format (YYYY-MM-DD)
 * @param date - The Date object to convert
 * @returns Date string in API format
 */
export function toApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Convert a JavaScript Date to API datetime format (ISO 8601 with timezone)
 * @param date - The Date object to convert
 * @returns ISO 8601 datetime string
 */
export function toApiWithTime(date: Date): string {
  return date.toISOString();
}

/**
 * Convert a JavaScript Date to API datetime format with local timezone offset
 * @param date - The Date object to convert
 * @returns ISO 8601 datetime string with local timezone
 */
export function toApiWithLocalTime(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Calculate timezone offset
  const offset = date.getTimezoneOffset();
  const offsetSign = offset <= 0 ? '+' : '-';
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Parse an API date/datetime string to a JavaScript Date object
 * @param value - The API date string
 * @returns Date object
 */
export function fromApi(value: string): Date {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${value}`);
  }
  return date;
}

/**
 * Check if a string is a valid date format
 * @param value - The string to check
 * @returns True if valid date format
 */
export function isValid(value: string): boolean {
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Get today's date in API format
 * @returns Today's date as YYYY-MM-DD
 */
export function today(): string {
  return toApi(new Date());
}

/**
 * Get date N days from today in API format
 * @param days - Number of days to add (negative for past)
 * @returns Date string in API format
 */
export function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toApi(date);
}

/**
 * Get date N weeks from today in API format
 * @param weeks - Number of weeks to add (negative for past)
 * @returns Date string in API format
 */
export function weeksFromNow(weeks: number): string {
  return daysFromNow(weeks * 7);
}

/**
 * Get date N months from today in API format
 * @param months - Number of months to add (negative for past)
 * @returns Date string in API format
 */
export function monthsFromNow(months: number): string {
  const date = new Date();
  date.setMonth(date.getMonth() + months);
  return toApi(date);
}

/**
 * Create a date range object for API queries
 * @param dateFrom - Start date
 * @param dateTo - End date
 * @returns Object with date_from and date_to in API format
 */
export function range(
  dateFrom: Date,
  dateTo: Date
): { date_from: string; date_to: string } {
  return {
    date_from: toApi(dateFrom),
    date_to: toApi(dateTo),
  };
}

