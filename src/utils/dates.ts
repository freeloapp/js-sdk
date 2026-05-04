/**
 * Date Utilities
 * Helpers for converting between API format and JavaScript Date objects.
 *
 * The Freelo API V1 transmits `date-time` fields (request and response) as
 * naive ISO 8601 strings without a timezone designator (e.g.
 * `"2024-01-15T10:30:00"`), interpreted as **Europe/Prague** local time
 * (CET/CEST, observing DST). See the OpenAPI spec ("Timestamp Format").
 *
 * `fromApi()` and `toApiWithTime()` honor that contract regardless of the
 * runtime's local timezone — the returned `Date` is the correct UTC instant,
 * and the formatted string is always Prague wall time without an offset.
 *
 * @example
 * ```typescript
 * import { dateToApi, toApiWithTime, dateFromApi } from '@freeloapp/js-sdk';
 *
 * dateToApi(new Date());                  // "2024-01-15"          (date only)
 * toApiWithTime(new Date());              // "2024-01-15T10:30:00" (naive Prague)
 * dateFromApi("2024-01-15T10:30:00");     // Date object (interpreted as Prague)
 * dateFromApi("2024-01-15T10:30:00+01:00"); // Date object (offset honored)
 * ```
 */

const NAIVE_DATETIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?$/;

const PRAGUE_PART_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Prague',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

const pad2 = (n: number): string => String(n).padStart(2, '0');

function pragueOffsetMs(utcMs: number): number {
  let year = 0;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const p of PRAGUE_PART_FORMATTER.formatToParts(new Date(utcMs))) {
    const v = Number(p.value);
    switch (p.type) {
      case 'year':
        year = v;
        break;
      case 'month':
        month = v;
        break;
      case 'day':
        day = v;
        break;
      case 'hour':
        hour = v % 24;
        break;
      case 'minute':
        minute = v;
        break;
      case 'second':
        second = v;
        break;
    }
  }
  return Date.UTC(year, month - 1, day, hour, minute, second) - utcMs;
}

function parsePragueNaive(s: string): Date {
  const m = NAIVE_DATETIME_RE.exec(s);
  if (!m) {
    throw new Error(`Invalid date value: ${s}`);
  }
  let baseUtc = Date.UTC(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
    Number(m[4]),
    Number(m[5]),
    Number(m[6])
  );
  const frac = m[7];
  if (frac !== undefined) {
    baseUtc += Math.round(parseFloat('0.' + frac) * 1000);
  }
  // Treat naive components as Prague wall time. Convert to UTC by subtracting
  // Prague's offset at the resulting instant. The second pass settles the
  // rare case where the first guess crossed a DST boundary.
  const firstGuess = baseUtc - pragueOffsetMs(baseUtc);
  return new Date(baseUtc - pragueOffsetMs(firstGuess));
}

/**
 * Convert a JavaScript Date to API date format (YYYY-MM-DD).
 *
 * @param date - The Date object to convert
 * @returns Date string in API format
 */
export function toApi(date: Date): string {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
}

/**
 * Convert a JavaScript Date to API datetime format — naive ISO 8601 in
 * Europe/Prague local time, e.g. `"2024-01-15T10:30:00"`.
 *
 * This is the format Freelo API V1 accepts for `date-time` request fields.
 * The result has no `Z` and no timezone offset; the server interprets it
 * as Europe/Prague. Output is independent of the runtime's local timezone.
 *
 * @param date - The Date object to convert
 * @returns Naive ISO 8601 string in Europe/Prague local time
 */
export function toApiWithTime(date: Date): string {
  let year = 0;
  let month = 1;
  let day = 1;
  let hour = 0;
  let minute = 0;
  let second = 0;
  for (const p of PRAGUE_PART_FORMATTER.formatToParts(date)) {
    const v = Number(p.value);
    switch (p.type) {
      case 'year':
        year = v;
        break;
      case 'month':
        month = v;
        break;
      case 'day':
        day = v;
        break;
      case 'hour':
        hour = v % 24;
        break;
      case 'minute':
        minute = v;
        break;
      case 'second':
        second = v;
        break;
    }
  }
  return `${year}-${pad2(month)}-${pad2(day)}T${pad2(hour)}:${pad2(minute)}:${pad2(second)}`;
}

/**
 * Alias of {@link toApiWithTime}. Kept for backward compatibility — the API's
 * "local time" is Europe/Prague.
 *
 * @param date - The Date object to convert
 * @returns Naive ISO 8601 string in Europe/Prague local time
 */
export function toApiWithLocalTime(date: Date): string {
  return toApiWithTime(date);
}

/**
 * Parse an API date/datetime string to a JavaScript Date object.
 *
 * Naive datetime strings (no `Z` and no `±HH:MM` offset, e.g.
 * `"2024-01-15T10:30:00"`) are interpreted as Europe/Prague local time
 * — that is what API V1 returns, regardless of the runtime's local
 * timezone. Strings with an explicit offset (or date-only strings) are
 * parsed via the standard `Date` constructor.
 *
 * @param value - The API date string
 * @returns Date object
 */
export function fromApi(value: string): Date {
  if (NAIVE_DATETIME_RE.test(value)) {
    return parsePragueNaive(value);
  }
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
