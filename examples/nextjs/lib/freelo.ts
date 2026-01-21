/**
 * Freelo SDK - Shared Client Instance
 *
 * Singleton pattern for the Freelo client to be used across API routes.
 */

import { Freelo } from '@freelo/js-sdk';

let freeloInstance: Freelo | null = null;

/**
 * Get the shared Freelo client instance
 */
export function getFreelo(): Freelo {
  if (!freeloInstance) {
    if (!process.env.FREELO_EMAIL || !process.env.FREELO_API_KEY) {
      throw new Error('FREELO_EMAIL and FREELO_API_KEY environment variables are required');
    }

    freeloInstance = new Freelo({
      email: process.env.FREELO_EMAIL,
      apiKey: process.env.FREELO_API_KEY,
      userAgent: 'NextJS-App/1.0',
    });
  }

  return freeloInstance;
}

/**
 * Export types for convenience
 */
export { FreeloApiError, RateLimitError } from '@freelo/js-sdk';
export type {
  ProjectWithTasklists,
  ProjectDetail,
  TaskFull,
  TaskCreated,
} from '@freelo/js-sdk';
