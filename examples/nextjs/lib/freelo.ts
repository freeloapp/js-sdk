/**
 * Freelo SDK - Shared Client Initialization
 *
 * Initializes the Freelo client once for use across API routes.
 */

import { createFreelo } from '@freeloapp/js-sdk';

let initialized = false;

/**
 * Ensure the Freelo client is initialized (call once at startup or in each route)
 */
export function initFreelo(): void {
  if (!initialized) {
    if (!process.env.FREELO_EMAIL || !process.env.FREELO_API_KEY) {
      throw new Error('FREELO_EMAIL and FREELO_API_KEY environment variables are required');
    }

    createFreelo({
      auth: { type: 'basic', email: process.env.FREELO_EMAIL, apiKey: process.env.FREELO_API_KEY },
      userAgent: 'NextJS-App/1.0',
    });

    initialized = true;
  }
}

/**
 * Export error utilities and types for convenience
 */
export { isFreeloError, isRateLimited, isUnauthorized, isNotFound } from '@freeloapp/js-sdk';
