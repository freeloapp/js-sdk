import { describe, it, expect } from 'vitest';
import { createFreelo } from '../src/freelo';
import { getProjects } from '../src/generated/sdk.gen';

/**
 * Smoke tests — run manually against real Freelo API:
 *
 *   FREELO_EMAIL=your@email.com FREELO_API_KEY=your-key npx vitest run test/smoke.test.ts
 */
describe.skipIf(!process.env.FREELO_EMAIL)('Smoke tests', () => {
  const client = createFreelo({
    email: process.env.FREELO_EMAIL!,
    apiKey: process.env.FREELO_API_KEY!,
    userAgent: 'FreeloSDK-SmokeTest/1.0',
  });

  it('fetches list of projects', async () => {
    const result = await getProjects({ client });
    expect(result.data).toBeDefined();
  });
});
