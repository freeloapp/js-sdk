/**
 * Currency Utilities
 * Helpers for converting between API format and standard currency values
 *
 * The Freelo API represents currency amounts multiplied by 100:
 * - API format: "100025" = 1000.25 in standard currency
 * - API format: "100000" = 1000.00 in standard currency
 *
 * @example
 * ```typescript
 * import { currency } from '@freelo/js-sdk';
 *
 * // Convert to API format
 * currency.toApi(1000.25); // "100025"
 * currency.toApi(1000);    // "100000"
 *
 * // Convert from API format
 * currency.fromApi("100025"); // 1000.25
 * currency.fromApi("100000"); // 1000
 * ```
 */

/**
 * Convert a standard currency value to API format
 * @param value - The currency value (e.g., 1000.25)
 * @returns The API format string (e.g., "100025")
 */
export function toApi(value: number): string {
  // Multiply by 100 and round to handle floating point precision
  const apiValue = Math.round(value * 100);
  return String(apiValue);
}

/**
 * Convert an API format string to a standard currency value
 * @param value - The API format string (e.g., "100025")
 * @returns The currency value (e.g., 1000.25)
 */
export function fromApi(value: string): number {
  const numericValue = parseInt(value, 10);
  if (isNaN(numericValue)) {
    throw new Error(`Invalid currency value: ${value}`);
  }
  return numericValue / 100;
}

/**
 * Format a currency value for display
 * @param value - The currency value
 * @param currency - The currency code (CZK, EUR, USD)
 * @param locale - The locale for formatting (defaults to based on currency)
 * @returns Formatted currency string
 */
export function format(
  value: number,
  currencyCode: 'CZK' | 'EUR' | 'USD',
  locale?: string
): string {
  const defaultLocales: Record<string, string> = {
    CZK: 'cs-CZ',
    EUR: 'de-DE',
    USD: 'en-US',
  };

  const formatLocale = locale ?? defaultLocales[currencyCode] ?? 'en-US';

  return new Intl.NumberFormat(formatLocale, {
    style: 'currency',
    currency: currencyCode,
  }).format(value);
}

/**
 * Convert API format directly to formatted display string
 * @param apiValue - The API format string
 * @param currencyCode - The currency code
 * @param locale - Optional locale override
 * @returns Formatted currency string
 */
export function formatFromApi(
  apiValue: string,
  currencyCode: 'CZK' | 'EUR' | 'USD',
  locale?: string
): string {
  return format(fromApi(apiValue), currencyCode, locale);
}

/**
 * Currency utility namespace
 */
export const currency = {
  toApi,
  fromApi,
  format,
  formatFromApi,
};

export default currency;
