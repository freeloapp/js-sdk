/**
 * Freelo SDK - Advanced Error Handling Example
 *
 * Demonstrates comprehensive error handling strategies.
 */

import {
  createFreelo,
  getProjects,
  getProject,
  createTask,
  isFreeloError,
  isRateLimited,
  isUnauthorized,
  isNotFound,
} from '@freeloapp/js-sdk';

createFreelo({
  auth: { type: 'basic', email: process.env.FREELO_EMAIL!, apiKey: process.env.FREELO_API_KEY! },
  userAgent: 'ErrorHandlingDemo/1.0',
});

/**
 * Example 1: Basic error handling with the { data, error } pattern
 */
async function basicErrorHandling(projectId: number) {
  const { data, error } = await getProject({ path: { project_id: projectId } });

  if (error) {
    console.error(`API Error:`, error);

    // Check specific error types
    if (isNotFound(error)) {
      console.log('Project not found');
      return null;
    }

    if (isUnauthorized(error)) {
      console.log('Invalid credentials - check your API key');
      throw new Error('Authentication failed');
    }

    if (isRateLimited(error)) {
      console.log('Rate limited - need to wait');
    }

    if (isFreeloError(error)) {
      console.log('General Freelo API error');
    }

    throw error;
  }

  return data;
}

/**
 * Example 2: Automatic retry on rate limiting
 */
async function withRateLimitRetry<T>(
  fn: () => Promise<{ data: T; error?: unknown }>,
  maxRetries = 3,
  delayMs = 60000
): Promise<T> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { data, error } = await fn();

    if (!error) {
      return data;
    }

    if (isRateLimited(error) && attempt < maxRetries) {
      console.log(`Rate limited. Waiting ${delayMs / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      continue;
    }

    throw error;
  }
  throw new Error('Max retries exceeded');
}

/**
 * Example 3: Safe wrapper that returns null on not found
 */
async function safeGetProject(projectId: number) {
  const { data, error } = await getProject({ path: { project_id: projectId } });

  if (error) {
    if (isNotFound(error)) {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Example 4: Handle validation errors
 */
async function createTaskWithValidation(tasklistId: number, name: string) {
  const { data, error } = await createTask({
    path: { tasklist_id: tasklistId },
    body: { name },
  });

  if (error) {
    if (isFreeloError(error)) {
      console.error('Validation / API error:', error);
    }
    throw error;
  }

  return data;
}

/**
 * Example 5: Circuit breaker pattern
 */
class CircuitBreaker {
  private failures = 0;
  private lastFailure: number | null = null;
  private readonly threshold = 5;
  private readonly resetTimeout = 60000;

  async execute<T>(fn: () => Promise<{ data: T; error?: unknown }>): Promise<T> {
    // Check if circuit is open
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open - service unavailable');
    }

    const { data, error } = await fn();

    if (error) {
      this.recordFailure();
      throw error;
    }

    this.reset();
    return data;
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
  const projects = await withRateLimitRetry(() => getProjects());
  console.log(`Found ${projects.length} projects`);

  // Example 3: Safe get
  console.log('\n=== Safe Get ===');
  const maybeProject = await safeGetProject(99999999);
  console.log('Project:', maybeProject); // null

  // Example 5: Circuit breaker
  console.log('\n=== Circuit Breaker ===');
  const breaker = new CircuitBreaker();
  try {
    await breaker.execute(() => getProjects());
    console.log('Success!');
  } catch (error: unknown) {
    console.error('Circuit breaker error:', error);
  }
}

demo().catch(console.error);
