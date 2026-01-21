# Advanced Examples

Advanced patterns and techniques for using the Freelo SDK.

## Prerequisites

- Node.js 18+
- Freelo account with API key

## Setup

Set environment variables:

```bash
export FREELO_EMAIL="your@email.tld"
export FREELO_API_KEY="your-api-key"
```

## Examples

### Error Handling

Comprehensive error handling strategies for production applications.

```bash
npx tsx error-handling.ts
```

**What it demonstrates:**
- Type-safe error checking with `FreeloApiError`
- Checking specific error types (not found, unauthorized, rate limited)
- Automatic retry on rate limiting
- Safe wrappers that return null on not found
- Validation error handling
- Circuit breaker pattern

### Pagination

Different strategies for handling paginated API responses.

```bash
npx tsx pagination.ts
```

**What it demonstrates:**
- Manual pagination with while loop
- Async generators for memory-efficient iteration
- Batch processing with concurrency control
- Parallel page fetching (with rate limit considerations)
- Paginator class pattern

### Bulk Operations

Patterns for performing operations on multiple resources efficiently.

```bash
npx tsx bulk-operations.ts
```

**What it demonstrates:**
- Creating multiple tasks with controlled concurrency
- Finishing multiple tasks in parallel
- Adding labels to multiple tasks
- Batch updates with rate limit handling
- Moving tasks between tasklists
- Bulk archiving projects

## Key Patterns

### Rate Limit Handling

The Freelo API allows 25 requests per minute. When exceeded, wait 60 seconds:

```typescript
try {
  await freelo.projects.list();
} catch (error) {
  if (error instanceof FreeloApiError && error.isRateLimited) {
    await new Promise(r => setTimeout(r, 60000));
    // Retry...
  }
}
```

### Concurrency Control

Limit parallel requests to avoid rate limiting:

```typescript
const batchSize = 5;
for (let i = 0; i < items.length; i += batchSize) {
  const batch = items.slice(i, i + batchSize);
  await Promise.all(batch.map(processItem));
  await delay(200); // Small delay between batches
}
```

### Graceful Degradation

Handle errors without failing the entire operation:

```typescript
const results = await Promise.allSettled(
  items.map(processItem)
);

const succeeded = results.filter(r => r.status === 'fulfilled');
const failed = results.filter(r => r.status === 'rejected');
```

### Memory-Efficient Iteration

Use async generators for large datasets:

```typescript
async function* iterateAll() {
  let page = 0;
  let hasMore = true;
  while (hasMore) {
    const response = await fetchPage(page);
    for (const item of response.data) {
      yield item;
    }
    hasMore = response.hasMore;
    page++;
  }
}

// Process one item at a time
for await (const item of iterateAll()) {
  await processItem(item);
}
```

## Best Practices

1. **Always handle rate limits** - The API has a 25 req/min limit
2. **Use batch processing** - Don't fire all requests at once
3. **Use Promise.allSettled** - Don't let one failure break everything
4. **Add delays between batches** - Prevents overwhelming the API
5. **Log progress** - For long-running operations, log progress
6. **Implement retries** - Network issues happen, retry with backoff
