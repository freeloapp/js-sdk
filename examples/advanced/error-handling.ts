/**
 * Freelo SDK - Advanced Error Handling Example
 *
 * Demonstrates comprehensive error handling strategies.
 */

import { Freelo, FreeloApiError, RateLimitError } from '@freelo/js-sdk';

const freelo = new Freelo({
  email: process.env.FREELO_EMAIL!,
  apiKey: process.env.FREELO_API_KEY!,
  userAgent: 'ErrorHandlingDemo/1.0',
});

/**
 * Example 1: Basic error handling with type checking
 */
async function basicErrorHandling(projectId: number) {
  try {
    return await freelo.projects.get(projectId);
  } catch (error: unknown) {
    if (error instanceof FreeloApiError) {
      console.error(`API Error: ${error.message} (Status: ${error.status})`);

      // Check specific error types
      if (error.isNotFound) {
        console.log('Project not found');
        return null;
      }

      if (error.isUnauthorized) {
        console.log('Invalid credentials - check your API key');
        throw new Error('Authentication failed');
      }

      if (error.isRateLimited) {
        console.log('Rate limited - need to wait');
      }

      if (error.isClientError) {
        console.log('Client error - check your request');
      }

      if (error.isServerError) {
        console.log('Server error - Freelo may be having issues');
      }
    }
    throw error;
  }
}

/**
 * Example 2: Automatic retry on rate limiting
 */
async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 60000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      if (error instanceof RateLimitError && attempt < maxRetries) {
        console.log(`Rate limited. Waiting ${delayMs / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Example 3: Safe wrapper that returns null on not found
 */
async function safeGetProject(projectId: number) {
  try {
    return await freelo.projects.get(projectId);
  } catch (error: unknown) {
    if (error instanceof FreeloApiError && error.isNotFound) {
      return null;
    }
    throw error;
  }
}

/**
 * Example 4: Handle validation errors
 */
async function createTaskWithValidation(tasklistId: number, name: string) {
  try {
    return await freelo.tasks.create(tasklistId, { name });
  } catch (error: unknown) {
    if (error instanceof FreeloApiError && error.errors) {
      // error.errors contains field-specific validation errors
      console.error('Validation errors:');
      for (const [field, messages] of Object.entries(error.errors)) {
        const messageList = Array.isArray(messages) ? messages.join(', ') : String(messages);
        console.error(`  ${field}: ${messageList}`);
      }
    }
    throw error;
  }
}

/**
 * Example 5: Circuit breaker pattern
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number | null = null;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open - service unavailable');
    }

    try {
      const result = await fn();
      this.reset();
      return result;
    } catch (error: unknown) {
      this.recordFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    if (this.failures < this.threshold) return false;
    if (this.lastFailure === null) return false;

    // Check if enough time has passed to try again
    const elapsed = Date.now() - this.lastFailure;
    return elapsed < this.resetTimeout;
  }

  private recordFailure(): void {
    this.failures++;
    this.lastFailure = Date.now();
  }

  private reset(): void {
    this.failures = 0;
    this.lastFailure = null;
  }
}

// Demo usage
async function demo() {
  // Example 1: Basic error handling
  console.log('=== Basic Error Handling ===');
  const project = await basicErrorHandling(99999999); // Non-existent ID
  console.log('Result:', project);

  // Example 2: With retry
  console.log('\n=== With Rate Limit Retry ===');
  const projects = await withRateLimitRetry(() => freelo.projects.list());
  console.log(`Found ${projects.length} projects`);

  // Example 3: Safe get
  console.log('\n=== Safe Get ===');
  const maybeProject = await safeGetProject(99999999);
  console.log('Project:', maybeProject); // null

  // Example 5: Circuit breaker
  console.log('\n=== Circuit Breaker ===');
  const breaker = new CircuitBreaker();
  try {
    await breaker.execute(() => freelo.projects.list());
    console.log('Success!');
  } catch (error: unknown) {
    console.error('Circuit breaker error:', error);
  }
}

demo().catch(console.error);
